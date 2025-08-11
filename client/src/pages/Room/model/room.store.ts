import { GamePhase } from "@/shared/constants";
import type { ChatMessage, Player } from "@/shared/types";
import { create } from "zustand";

type RoomState = {
  playerId: string;
  players: Player[];
  drawerId?: string;
  phase: GamePhase;
  timer?: number;
  wordForMe?: string;
  chooseWords?: string[];
  messages: ChatMessage[];
  round: number;
  maxRounds: number;
  gameEnded: boolean;
  winner: Player | null;
  finalScores: Player[];
  isConnected: boolean;
};

type RoomActions = {
  setState: (
    partial: Partial<RoomState> | ((state: RoomState) => Partial<RoomState>)
  ) => void;
  reset: VoidFunction;
};

const initialState: RoomState = {
  playerId: "",
  players: [],
  drawerId: undefined,
  phase: GamePhase.Waiting,
  timer: undefined,
  wordForMe: undefined,
  chooseWords: undefined,
  messages: [],
  round: 0,
  maxRounds: 5,
  gameEnded: false,
  winner: null,
  finalScores: [],
  isConnected: false,
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,
  setState: (partial) => set(partial),
  reset: () => set(initialState),
}));
