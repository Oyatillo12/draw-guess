import { useCallback, useRef, useState } from "react";
import type { CanvasConfig, CanvasDimensions } from "../model/types";
import { getCanvasCoordinates } from "../lib/canvas-utils";
import type { Stroke } from "@/shared/types";

export const useDrawing = (
  canDraw: boolean,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  drawStroke: (stroke: Stroke) => void,
  config: CanvasConfig
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStroke = useRef<[number, number][]>([]);

  const getCanvasDimensions = useCallback((): CanvasDimensions => {
    const canvas = canvasRef.current;
    if (!canvas) return { width: 0, height: 0, left: 0, top: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canDraw) return;
      e.preventDefault();

      const dimensions = getCanvasDimensions();
      const coords = getCanvasCoordinates(e.clientX, e.clientY, dimensions);

      setIsDrawing(true);
      currentStroke.current = [[coords.x, coords.y]];
    },
    [canDraw]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!canDraw || !isDrawing) return;
      e.preventDefault();

      const dimensions = getCanvasDimensions();
      const coords = getCanvasCoordinates(e.clientX, e.clientY, dimensions);

      currentStroke.current.push([coords.x, coords.y]);

      const localStroke: Stroke = {
        id: "local",
        color: config.color,
        width: config.width,
        points: currentStroke.current,
      };

      drawStroke(localStroke);
    },
    [canDraw, isDrawing, getCanvasDimensions, drawStroke, config]
  );

  const handlePointerUp = useCallback(() => {
    if (!canDraw || !isDrawing) return;
    setIsDrawing(false);
    currentStroke.current = [];
  }, [canDraw, isDrawing]);

  return {
    isDrawing,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
