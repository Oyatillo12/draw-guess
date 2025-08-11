import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Room, Player } from './types';
import { allWords } from './constants';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true },
});

const rooms: Record<string, Room> = {};

function makeCode(length = 4) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

function pickRandomWords(count = 3) {
  const shuffled = [...allWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function calculateScore(timeLeft: number, baseScore = 100) {
  // Bonus points for guessing quickly
  const timeBonus = Math.floor(timeLeft * 0.5);
  return baseScore + timeBonus;
}

function startNextRound(code: string) {
  const room = rooms[code];
  if (!room) return;

  // Clear any existing intervals
  if (room.chooseInterval) clearInterval(room.chooseInterval);
  if (room.drawInterval) clearInterval(room.drawInterval);

  // Check if game should end
  if (room.round && room.round >= room.maxRounds) {
    endGame(code);
    return;
  }

  // Pick next drawer
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

  // Clear canvas for all players
  io.to(code).emit('clearCanvas');

  // Notify who is drawing
  io.to(code).emit('roundStart', {
    drawerId: nextDrawer,
    round: room.round,
    phase: 'choosing',
    maxRounds: room.maxRounds,
  });

  // Give drawer word options
  const words = pickRandomWords(3);
  io.to(nextDrawer).emit('chooseWord', { words });

  // Countdown for choosing
  room.timer = room.chooseTime;
  room.chooseInterval = setInterval(() => {
    if (!room) return;
    room.timer!--;
    io.to(code).emit('timer', room.timer);

    if (room.timer! <= 0) {
      if (room.chooseInterval) clearInterval(room.chooseInterval);
      if (!room.word) {
        // If drawer didn't choose, pick random
        room.word = words[Math.floor(Math.random() * words.length)];
      }
      startDrawingPhase(code);
    }
  }, 1000);
}

function startDrawingPhase(code: string) {
  const room = rooms[code];
  if (!room) return;

  room.phase = 'drawing';
  room.timer = room.roundTime;

  // Notify players (word hidden for guessers)
  io.to(code).emit('drawingStart', {
    drawerId: room.drawerId,
  });

  // Send actual word to drawer
  if (room.drawerId) {
    io.to(room.drawerId).emit('yourWord', { word: room.word });
  }

  // Countdown for drawing phase
  room.drawInterval = setInterval(() => {
    if (!room) return;
    room.timer!--;
    io.to(code).emit('timer', room.timer);

    if (room.timer! <= 0) {
      if (room.drawInterval) clearInterval(room.drawInterval);
      endRound(code);
    }
  }, 1000);
}

function endRound(code: string) {
  const room = rooms[code];
  if (!room) return;

  room.phase = 'roundEnd';

  // Award points to drawer if someone guessed
  if (room.guessedPlayers.size > 0 && room.drawerId) {
    const drawerBonus = room.guessedPlayers.size * 25; // 25 points per correct guess
    room.players[room.drawerId].score += drawerBonus;
  }

  io.to(code).emit('roundEnd', {
    word: room.word,
    drawerId: room.drawerId,
    guessedPlayers: Array.from(room.guessedPlayers),
    scores: Object.values(room.players),
  });

  // Wait 3 seconds before next round
  setTimeout(() => {
    if (room.round && room.round >= room.maxRounds) {
      endGame(code);
    } else {
      startNextRound(code);
    }
  }, 3000);
}

function endGame(code: string) {
  const room = rooms[code];
  if (!room) return;

  // Clear any remaining intervals
  if (room.chooseInterval) clearInterval(room.chooseInterval);
  if (room.drawInterval) clearInterval(room.drawInterval);

  // Calculate final scores and winner
  const players = Object.values(room.players);
  const winner = players.reduce((prev, current) =>
    prev.score > current.score ? prev : current,
  );

  io.to(code).emit('gameEnd', {
    winner,
    players,
    finalScores: players.sort((a, b) => b.score - a.score),
  });

  // Clean up room after a delay
  setTimeout(() => {
    delete rooms[code];
  }, 10000);
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('createRoom', (payload, cb) => {
    const code = makeCode(4);
    rooms[code] = {
      code,
      players: {},
      strokes: [],
      round: 0,
      phase: 'waiting',
      maxRounds: 5,
      roundTime: 60,
      chooseTime: 15, // Increased from 10 to 15 seconds
      guessedPlayers: new Set(),
    };
    cb && cb({ code });
  });

  socket.on('joinRoom', ({ code, name }, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'Room not found' });

    room.players[socket.id] = {
      id: socket.id,
      name,
      score: 0,
      isReady: true,
    };

    socket.join(code);

    // send current state
    socket.emit('roomState', {
      players: Object.values(room.players),
      strokes: room.strokes,
      drawerId: room.drawerId,
      phase: room.phase,
      round: room.round,
      maxRounds: room.maxRounds,
    });

    io.to(code).emit('updatePlayers', Object.values(room.players));
    cb && cb({ ok: true });

    // Start game if enough players and in waiting phase
    if (room.phase === 'waiting' && Object.keys(room.players).length >= 2) {
      startNextRound(code);
    }
  });

  socket.on('stroke', ({ code, stroke }) => {
    const room = rooms[code];
    if (!room || room.drawerId !== socket.id || room.phase !== 'drawing')
      return;

    room.strokes.push(stroke);
    // Broadcast to all other players in the room
    socket.to(code).emit('stroke', stroke);
  });

  socket.on('clearCanvas', ({ code }) => {
    const room = rooms[code];
    if (!room || room.drawerId !== socket.id) return;

    room.strokes = [];
    io.to(code).emit('clearCanvas');
  });

  socket.on('chooseWord', ({ code, word }) => {
    const room = rooms[code];
    if (!room || room.drawerId !== socket.id || room.phase !== 'choosing')
      return;

    room.word = word;
    // Clear the choose interval and start drawing immediately
    if (room.chooseInterval) clearInterval(room.chooseInterval);
    startDrawingPhase(code);
  });

  socket.on('guess', ({ code, guess }, cb) => {
    const room = rooms[code];
    if (!room || room.phase !== 'drawing') return;

    const normalized = (guess || '').trim().toLowerCase();
    const player = room.players[socket.id];

    if (!player) return cb && cb({ error: 'Player not found' });

    if (
      room.word &&
      normalized === room.word.toLowerCase() &&
      socket.id !== room.drawerId &&
      !room.guessedPlayers.has(socket.id)
    ) {
      // Calculate score based on time left
      const timeLeft = room.timer || 0;
      const score = calculateScore(timeLeft);

      player.score += score;
      room.guessedPlayers.add(socket.id);

      io.to(code).emit('correctGuess', {
        playerId: socket.id,
        name: player.name,
        guess,
        score,
        timeLeft,
      });

      io.to(code).emit('updatePlayers', Object.values(room.players));

      // Check if all non-drawer players have guessed
      const nonDrawerPlayers = Object.keys(room.players).filter(
        (id) => id !== room.drawerId,
      );
      if (room.guessedPlayers.size === nonDrawerPlayers.length) {
        // All players guessed correctly, end round early
        setTimeout(() => endRound(code), 1000);
      }
    } else {
      // Regular chat message
      io.to(code).emit('chat', {
        id: socket.id,
        name: player.name,
        message: guess,
      });
    }

    cb && cb({ ok: true });
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      if (rooms[code].players[socket.id]) {
        delete rooms[code].players[socket.id];

        // If no players left, delete room
        if (Object.keys(rooms[code].players).length === 0) {
          // Clear any intervals before deleting
          if (rooms[code].chooseInterval)
            clearInterval(rooms[code].chooseInterval);
          if (rooms[code].drawInterval) clearInterval(rooms[code].drawInterval);
          delete rooms[code];
        } else {
          io.to(code).emit('updatePlayers', Object.values(rooms[code].players));

          // If drawer disconnected, start new round after a delay
          if (
            rooms[code].drawerId === socket.id &&
            rooms[code].phase === 'drawing'
          ) {
            // Clear any existing intervals
            if (rooms[code].chooseInterval)
              clearInterval(rooms[code].chooseInterval);
            if (rooms[code].drawInterval)
              clearInterval(rooms[code].drawInterval);
            setTimeout(() => startNextRound(code), 2000);
          }
        }
      }
    }
    console.log('disconnected:', socket.id);
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
