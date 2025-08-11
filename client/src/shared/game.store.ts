import { create } from "zustand";
import type { Player } from "./types";
import { devtools, persist } from "zustand/middleware";

type GameState = {
  roomCode: string;
  player: Player;
  setRoomCode: (code: string) => void;
  setPlayer: (player: Player) => void;
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        roomCode: "",
        player: {
          name: "Player",
        },
        setRoomCode: (code) => set({ roomCode: code }),
        setPlayer: (player) => set({ player }),
      }),
      {
        name: "gameStore",
      }
    )
  )
);
