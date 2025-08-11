export type Player = {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
};

export type Stroke = {
  id: string;
  color: string;
  width: number;
  points: [number, number][];
};

export interface Room {
  code: string;
  players: Record<string, Player>;
  strokes: Stroke[];
  drawerId?: string;
  word?: string;
  round?: number;
  timer?: number;
  phase?: 'waiting' | 'choosing' | 'drawing' | 'roundEnd';
  maxRounds: number;
  roundTime: number;
  chooseTime: number;
  guessedPlayers: Set<string>;
  roundStartTime?: number;
  chooseInterval?: NodeJS.Timeout;
  drawInterval?: NodeJS.Timeout;
}
