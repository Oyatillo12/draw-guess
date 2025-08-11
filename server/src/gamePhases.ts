import { Server } from 'socket.io';
import { rooms } from './roomManager';
import { pickRandomWords, calculateScore, clearIntervals } from './utils';
import { Room } from './types';

export function startNextRound(io: Server, code: string) {
  const room = rooms[code];
  if (!room) return;

  clearIntervals(room);

  // Check if game should end
  if (room.round && room.round >= room.maxRounds) {
    return endGame(io, code);
  }

  const playerIds = Object.keys(room.players);
  if (playerIds.length === 0) return;

  const nextDrawer =
    playerIds[(room.round || 0) % playerIds.length] || playerIds[0];
  room.drawerId = nextDrawer;
  room.word = undefined;
  room.phase = 'choosing';
  room.round = (room.round || 0) + 1;
  room.strokes = [];
  room.guessedPlayers = new Set();
  room.roundStartTime = Date.now();

  io.to(code).emit('clearCanvas');

  io.to(code).emit('roundStart', {
    drawerId: nextDrawer,
    round: room.round,
    phase: room.phase,
    maxRounds: room.maxRounds,
  });

  const words = pickRandomWords(3);
  io.to(nextDrawer).emit('chooseWord', { words });

  room.timer = room.chooseTime;
  room.chooseInterval = setInterval(() => {
    if (!rooms[code]) return;
    room.timer!--;
    io.to(code).emit('timer', room.timer);

    if (room.timer! <= 0) {
      clearInterval(room.chooseInterval!);
      if (!room.word) {
        room.word = words[Math.floor(Math.random() * words.length)];
      }
      startDrawingPhase(io, code);
    }
  }, 1000);
}

export function startDrawingPhase(io: Server, code: string) {
  const room = rooms[code];
  if (!room) return;

  room.phase = 'drawing';
  room.timer = room.roundTime;

  io.to(code).emit('drawingStart', { drawerId: room.drawerId });
  if (room.drawerId) {
    io.to(room.drawerId).emit('yourWord', { word: room.word });
  }

  room.drawInterval = setInterval(() => {
    if (!rooms[code]) return;
    room.timer!--;
    io.to(code).emit('timer', room.timer);

    if (room.timer! <= 0) {
      clearInterval(room.drawInterval!);
      endRound(io, code);
    }
  }, 1000);
}

export function endRound(io: Server, code: string) {
  const room = rooms[code];
  if (!room) return;

  room.phase = 'roundEnd';

  if (room.guessedPlayers.size > 0 && room.drawerId) {
    const drawerBonus = room.guessedPlayers.size * 25;
    room.players[room.drawerId].score += drawerBonus;
  }

  io.to(code).emit('roundEnd', {
    word: room.word,
    drawerId: room.drawerId,
    guessedPlayers: Array.from(room.guessedPlayers),
    scores: Object.values(room.players),
  });

  setTimeout(() => {
    if (room.round && room.round >= room.maxRounds) {
      endGame(io, code);
    } else {
      startNextRound(io, code);
    }
  }, 3000);
}

export function endGame(io: Server, code: string) {
  const room = rooms[code];
  if (!room) return;

  clearIntervals(room);

  const players = Object.values(room.players);
  const winner = players.reduce((prev, curr) =>
    prev.score > curr.score ? prev : curr,
  );

  io.to(code).emit('gameEnd', {
    winner,
    players,
    finalScores: players.sort((a, b) => b.score - a.score),
  });

  setTimeout(() => {
    delete rooms[code];
  }, 10000);
}
