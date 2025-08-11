import { Button } from "@/shared/components";
import { CANVAS_TOOL_MAX_WIDTH, CANVAS_TOOL_MIN_WIDTH } from "../../constants";
import type { CanvasConfig } from "../../model/types";
import { motion } from "framer-motion";

type CanvasToolbarProps = {
  config: CanvasConfig;
  onConfigChange: (config: CanvasConfig) => void;
  onClear: VoidFunction;
  isDrawer: boolean;
};

export const CanvasToolbar = ({
  config,
  onConfigChange,
  onClear,
  isDrawer,
}: CanvasToolbarProps) => {
  if (!isDrawer) return null;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...config, color: e.target.value });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...config, width: parseInt(e.target.value, 10) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl border-b border-indigo-200"
    >
      <div className="flex items-center gap-2 sm:gap-1">
        <label
          htmlFor="color"
          className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap"
        >
          Color:
        </label>
        <input
          value={config.color}
          type="color"
          name="color"
          id="color"
          onChange={handleColorChange}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
          Width:
        </label>
        <input
          type="range"
          min={CANVAS_TOOL_MIN_WIDTH}
          max={CANVAS_TOOL_MAX_WIDTH}
          value={config.width}
          onChange={handleWidthChange}
          className="w-16 sm:w-24 cursor-pointer"
        />
        <span className="text-xs sm:text-sm font-mono text-gray-600 w-6 sm:w-8">
          {config.width}
        </span>
      </div>

      <Button
        onClick={onClear}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
      >
        <span>🗑️</span>
        <span>Clear</span>
      </Button>
    </motion.div>
  );
};
