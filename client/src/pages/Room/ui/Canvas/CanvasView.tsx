import { GamePhase } from "@/shared/constants";
import { cn } from "@/shared/utils/cn";
import { motion } from "framer-motion";

type CanvasViewProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canDraw: boolean;
  phase?: GamePhase;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: VoidFunction;
};

export const CanvasView = ({
  canDraw,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  phase,
}: CanvasViewProps) => {
  return (
    <motion.div
      className="flex-1 border-2 border-gray-300 rounded-b-2xl bg-white overflow-hidden relative min-h-[300px] sm:min-h-[400px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full h-full",
          canDraw ? "cursor-crosshair" : "cursor-default"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none" }}
      />

      {phase === GamePhase.RoundEnd && (
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-2xl border border-gray-200">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-2">🏁</div>
            <div className="font-semibold text-gray-800 text-sm sm:text-base">
              Round ended!
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              Preparing for next round...
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
          <div>Phase: {phase}</div>
          <div>Can Draw: {canDraw ? "Yes" : "No"}</div>
        </div>
      )}
    </motion.div>
  );
};
