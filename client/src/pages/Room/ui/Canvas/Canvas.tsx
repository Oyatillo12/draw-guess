import { useCallback, useEffect, useRef, useState } from "react";
import type { Stroke } from "@/shared/types";
import { GamePhase } from "@/shared/constants";
import { CanvasView } from "./CanvasView";
import { CanvasToolbar } from "./CanvasToolbar";
import type { Socket } from "socket.io-client";

interface CanvasProps {
  socket: Socket | null;
  roomCode: string;
  playerId: string;
  drawerId?: string;
  word?: string;
  phase?: GamePhase;
}

export function Canvas({
  roomCode,
  playerId,
  drawerId,
  phase,
  socket,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(4);
  const currentStroke = useRef<[number, number][]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawer = playerId === drawerId;
  const canDraw = isDrawer && phase === "drawing";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("❌ Canvas ref not ready");
      return;
    }

    // Ensure canvas has proper dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      console.log("📏 Canvas dimensions set:", {
        width: canvas.width,
        height: canvas.height,
      });
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("❌ Could not get 2D context");
      return;
    }

    console.log("✅ Canvas context initialized:", {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      color: color,
      width: width,
    });

    contextRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
  }, [color, width]);

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];

      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      return [x, y];
    },
    []
  );

  const drawStroke = useCallback((stroke: Stroke) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) {
      console.log("❌ Cannot draw stroke - canvas or context not ready");
      return;
    }

    console.log("🎨 Drawing stroke:", {
      strokeId: stroke.id,
      color: stroke.color,
      width: stroke.width,
      points: stroke.points.length,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    stroke.points.forEach((point, index) => {
      const x = point[0] * canvas.width;
      const y = point[1] * canvas.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    console.log("✅ Stroke drawn successfully");
  }, []);

  useEffect(() => {
    if (contextRef.current && strokes.length > 0) {
      console.log("🔄 Redrawing strokes after context initialization:", {
        strokesCount: strokes.length,
        contextReady: !!contextRef.current,
      });
      strokes.forEach((stroke, index) => {
        console.log(`🔄 Redrawing stroke ${index + 1}/${strokes.length}`);
        drawStroke(stroke);
      });
    }
  }, [contextRef.current, strokes, drawStroke]);

  const clearCanvasWithoutEmit = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const clearCanvas = useCallback(() => {
    clearCanvasWithoutEmit();
    setStrokes([]);
    socket?.emit("clearCanvas", { code: roomCode });
  }, [clearCanvasWithoutEmit, roomCode, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleStroke = (stroke: Stroke) => {
      console.log("🎨 Received stroke from server:", {
        strokeId: stroke.id,
        color: stroke.color,
        width: stroke.width,
        points: stroke.points.length,
        isLocal: stroke.id === "local",
        contextReady: !!contextRef.current,
        canvasReady: !!canvasRef.current,
      });

      // Don't add to local strokes if it's our own stroke
      if (stroke.id !== "local") {
        // Ensure canvas is ready before drawing
        if (contextRef.current) {
          console.log("🎨 Drawing stroke immediately");
          drawStroke(stroke);
          setStrokes((prev) => [...prev, stroke]);
        } else {
          console.log("🎨 Canvas not ready, adding to strokes queue");
          // If canvas not ready, add to strokes and draw when ready
          setStrokes((prev) => [...prev, stroke]);
        }
      } else {
        console.log("🎨 Ignoring local stroke");
      }
    };

    const handleRoomState = (state: any) => {
      console.log("🏠 Room state received:", {
        strokesCount: state.strokes?.length || 0,
        phase: state.phase,
        drawerId: state.drawerId,
        contextReady: !!contextRef.current,
      });

      if (state.strokes && Array.isArray(state.strokes)) {
        console.log("🏠 Clearing canvas and redrawing strokes");
        clearCanvasWithoutEmit();
        setStrokes(state.strokes);
        // Draw strokes when canvas is ready
        if (contextRef.current) {
          console.log("🏠 Drawing all strokes from room state");
          state.strokes.forEach((stroke: Stroke, index: number) => {
            console.log(
              `🏠 Drawing stroke ${index + 1}/${state.strokes.length}`
            );
            drawStroke(stroke);
          });
        } else {
          console.log(
            "🏠 Canvas not ready, strokes will be drawn when context is available"
          );
        }
      }
    };

    const handleClearCanvas = () => {
      console.log("🧹 Clear canvas event received");
      clearCanvasWithoutEmit();
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
  }, [socket, drawStroke, clearCanvasWithoutEmit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ctx = contextRef.current;

      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.putImageData(imageData, 0, 0);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [color, width]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canDraw) return;

      e.preventDefault();
      setIsDrawing(true);
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      currentStroke.current = [coords];
    },
    [canDraw, getCanvasCoordinates]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!canDraw || !isDrawing) return;

      e.preventDefault();
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      currentStroke.current.push(coords);

      const localStroke: Stroke = {
        id: "local",
        color,
        width,
        points: currentStroke.current,
      };
      drawStroke(localStroke);
    },
    [canDraw, isDrawing, getCanvasCoordinates, color, width, drawStroke]
  );

  const handlePointerUp = useCallback(() => {
    if (!canDraw || !isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.current.length > 1) {
      const stroke: Stroke = {
        id: Date.now().toString(),
        color,
        width,
        points: [...currentStroke.current],
      };

      console.log("Sending stroke to server:", stroke);
      socket?.emit("stroke", { code: roomCode, stroke });

      // Add to local strokes for consistency
      setStrokes((prev) => [...prev, stroke]);
    }

    currentStroke.current = [];
  }, [canDraw, isDrawing, color, width, roomCode, socket]);

  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      <CanvasToolbar
        config={{ color, width }}
        onConfigChange={(config) => {
          setColor(config.color);
          setWidth(config.width);
        }}
        onClear={clearCanvas}
        isDrawer={isDrawer}
      />

      <CanvasView
        canvasRef={canvasRef}
        canDraw={canDraw}
        phase={phase}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}
