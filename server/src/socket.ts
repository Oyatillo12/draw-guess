import { Server, Socket } from 'socket.io';
import { createRoom, getRoom, deleteRoom, rooms } from './roomManager.js';
import { endRound, startDrawingPhase, startNextRound } from './gamePhases.js';
import { calculateScore, clearIntervals } from './utils.js';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log('connected:', socket.id);

    socket.on('createRoom', (_, cb) => {
      const room = createRoom();

      cb?.({ code: room.code });
    });

    socket.on('joinRoom', ({ code, name }, cb) => {
      const room = getRoom(code);
      if (!room) return cb?.({ error: 'Room not found' });

      room.players[socket.id] = {
        id: socket.id,
        name,
        score: 0,
        isReady: true,
      };

      socket.join(code);

      socket.emit('roomState', {
        players: Object.values(room.players),
        strokes: room.strokes,
        drawerId: room.drawerId,
        phase: room.phase,
        round: room.round,
        maxRounds: room.maxRounds,
      });

      console.log('Room state sent to player:', {
        playerId: socket.id,
        playerName: name,
        strokesCount: room.strokes.length,
        phase: room.phase,
        drawerId: room.drawerId,
      });

      io.to(code).emit('updatePlayers', Object.values(room.players));
      cb?.({ ok: true });

      if (room.phase === 'waiting' && Object.keys(room.players).length >= 2) {
        startNextRound(io, code);
      }
    });

    socket.on('stroke', ({ code, stroke }) => {
      const room = getRoom(code);
      if (!room || room.drawerId !== socket.id || room.phase !== 'drawing') {
        console.log('Stroke rejected:', {
          hasRoom: !!room,
          isDrawer: room?.drawerId === socket.id,
          phase: room?.phase,
          socketId: socket.id,
        });
        return;
      }

      console.log('Stroke received from drawer:', {
        drawerId: socket.id,
        strokeId: stroke.id,
        points: stroke.points.length,
      });

      room.strokes.push(stroke);
      socket.to(code).emit('stroke', stroke);
      console.log('Stroke broadcasted to other players');
    });

    socket.on('clearCanvas', ({ code }) => {
      const room = getRoom(code);
      if (!room || room.drawerId !== socket.id) return;

      room.strokes = [];
      io.to(code).emit('clearCanvas');
    });

    socket.on('chooseWord', ({ code, word }) => {
      const room = getRoom(code);
      if (!room || room.drawerId !== socket.id || room.phase !== 'choosing')
        return;

      room.word = word;
      if (room.chooseInterval) clearInterval(room.chooseInterval);
      startDrawingPhase(io, code);
    });

    socket.on('guess', (payload, cb) => {
      handleGuess(io, socket, payload.code, payload.guess, cb);
    });

    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });
  });
}

function handleGuess(
  io: Server,
  socket: Socket,
  code: string,
  guess: string,
  cb?: Function,
) {
  const room = getRoom(code);
  if (!room || room.phase !== 'drawing') return;

  const normalized = (guess || '').trim().toLowerCase();
  const player = room.players[socket.id];
  if (!player) return cb?.({ error: 'Player not found' });

  // ✅ Correct guess
  if (
    room.word &&
    normalized === room.word.toLowerCase() &&
    socket.id !== room.drawerId &&
    !room.guessedPlayers.has(socket.id)
  ) {
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

    const nonDrawerPlayers = Object.keys(room.players).filter(
      (id) => id !== room.drawerId,
    );
    if (room.guessedPlayers.size === nonDrawerPlayers.length) {
      setTimeout(() => endRound(io, code), 1000);
    }
  } else {
    io.to(code).emit('chat', {
      id: socket.id,
      name: player.name,
      message: guess,
    });
  }

  cb?.({ ok: true });
}

function handleDisconnect(io: Server, socket: Socket) {
  for (const code in rooms) {
    const room = rooms[code];
    if (!room.players[socket.id]) continue;

    delete room.players[socket.id];

    if (Object.keys(room.players).length === 0) {
      clearIntervals(room);
      deleteRoom(code);
    } else {
      io.to(code).emit('updatePlayers', Object.values(room.players));

      if (room.drawerId === socket.id && room.phase === 'drawing') {
        clearIntervals(room);
        setTimeout(() => startNextRound(io, code), 2000);
      }
    }
  }

  console.log('disconnected:', socket.id);
}
