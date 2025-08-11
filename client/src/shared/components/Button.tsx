import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type ButtonProps = {
  loading?: boolean;
  children: ReactNode;
} & HTMLMotionProps<"button">;

export const Button = ({
  loading = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={cn(
        "w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl  disabled:opacity-50 disabled:cursor-not-allowed transition-all  duration-200 flex items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};
