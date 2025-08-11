import type { CanvasConfig, CanvasCoordinates, CanvasDimensions } from "../model/types";

export const getCanvasCoordinates = (
  clientX: number,
  clientY: number,
  dimensions: CanvasDimensions
): CanvasCoordinates => {
  const x = (clientX - dimensions.left) / dimensions.width;
  const y = (clientY - dimensions.top) / dimensions.height;
  return { x, y };
};

export const initializeCanvasContext = (
  canvas: HTMLCanvasElement,
  config: CanvasConfig
): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.width;

  return ctx;
};

export const resizeCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  ctx.putImageData(imageData, 0, 0);
};