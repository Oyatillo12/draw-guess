import type { Stroke } from "@/shared/types";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";

export const useSocketHandlers = (
  socket: Socket | null,
  drawStroke: (stroke: Stroke) => void,
  clearCanvas: VoidFunction,
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>
) => {
  useEffect(() => {
    if (!socket) return;

    const handleStroke = (stroke: Stroke) => {
      if (stroke.id !== "local") {
        drawStroke(stroke);
        setStrokes((prev) => [...prev, stroke]);
      }
    };

    const handleRoomState = (state: any) => {
      if (state.strokes && Array.isArray(state.strokes)) {
        clearCanvas();
        setStrokes(state.strokes);
        state.strokes.forEach(drawStroke);
      }
    };

    const handleClearCanvas = () => {
      clearCanvas();
      setStrokes([]);
    };

    socket.on("stroke", handleStroke);
    socket.on("roomState", handleRoomState);
    socket.on("clearCanvas", handleClearCanvas);

    return () => {
      socket.off("stroke", handleStroke);
      socket.off("roomState", handleRoomState);
      socket.off("clearCanvas", handleClearCanvas);
    };
  }, [drawStroke, clearCanvas]);
};
