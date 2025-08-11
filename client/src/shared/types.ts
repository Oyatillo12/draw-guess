import type { ChatType } from "./constants";

export type Player = {
  id?: string;
  name: string;
  score?: number;
  isReady?: boolean;
};

export type Stroke = {
  id: string;
  color: string;
  width: number;
  points: [number, number][];
};

export type ChatMessage = {
  id: string;
  name?: string;
  message: string;
  type?: ChatType;
  score?: number;
  timeLeft?: number;
};

export interface GameEndData {
  winner: Player | null;
  finalScores: Player[];
}
