import { useEffect, useRef, useState } from "react";
import { CANVAS_DEFAULT_CONFIG } from "../constants";
import type { Stroke } from "@/shared/types";
import { initializeCanvasContext, resizeCanvas } from "../lib/canvas-utils";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const [config, setConfig] = useState(CANVAS_DEFAULT_CONFIG);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = initializeCanvasContext(canvas, config);
      contextRef.current = ctx;
    } catch (error) {
      console.error("Canvas initialization error:", error);
    }
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const handleResize = () => resizeCanvas(canvas, ctx);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    canvasRef,
    contextRef,
    config,
    setConfig,
    strokes,
    setStrokes,
  };
};
