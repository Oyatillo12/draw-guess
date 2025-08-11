import { GamePhase } from "@/shared/constants";
import type { CanvasConfig } from "./model/types";

export const CANVAS_DEFAULT_CONFIG: CanvasConfig = {
  color: "#000000",
  width: 4,
};

export const CANVAS_TOOL_MIN_WIDTH = 1;
export const CANVAS_TOOL_MAX_WIDTH = 20;



export const PHASE_DISPLAY_NAMES: Record<GamePhase, string> = {
  [GamePhase.Waiting]: "⏳ Waiting",
  [GamePhase.Choosing]: "🎯 Choosing Word",
  [GamePhase.Drawing]: "🎨 Drawing",
  [GamePhase.RoundEnd]: "🏁 Round End",
};

export const MAX_ROUNDS = 5;
