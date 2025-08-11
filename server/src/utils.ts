import { allWords } from './constants';

export function makeCode(length = 4) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

export function pickRandomWords(count = 3): string[] {
  return [...allWords].sort(() => Math.random() - 0.5).slice(0, count);
}

export function calculateScore(timeLeft: number, baseScore = 100): number {
  return baseScore + Math.floor(timeLeft * 0.5);
}

export function clearIntervals(room: any) {
  if (room.chooseInterval) clearInterval(room.chooseInterval);
  if (room.drawInterval) clearInterval(room.drawInterval);
}
