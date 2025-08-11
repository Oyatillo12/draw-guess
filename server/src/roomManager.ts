import { Room } from './types.js';
import { makeCode } from './utils.js';

export const rooms: Record<string, Room> = {};

export function createRoom(): Room {
  const code = makeCode(4);
  const newRoom: Room = {
    code,
    players: {},
    strokes: [],
    round: 0,
    phase: 'waiting',
    maxRounds: 5,
    roundTime: 60,
    chooseTime: 15,
    guessedPlayers: new Set(),
  };
  rooms[code] = newRoom;
  return newRoom;
}

export function getRoom(code: string): Room | undefined {
  return rooms[code];
}

export function deleteRoom(code: string) {
  delete rooms[code];
}
