import { create } from "zustand";
import { LobbyTabKeys } from "./config/constants";

type LobbyState = {
  activeTab: LobbyTabKeys;
  setActiveTab: (params: LobbyTabKeys) => void;
};

export const useLobbyStore = create<LobbyState>((set) => ({
  activeTab: LobbyTabKeys.Create,
  setActiveTab: (params) => set({ activeTab: params }),
}));
