import { motion } from "framer-motion";

export const Loading = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Spinning + pulsing circle */}
      <motion.div
        className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute top-5 sm:top-8 md:top-10 left-1/2 -translate-x-1/2 border-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
          style={{
            borderColor: "transparent",
            borderTopColor: "#6366F1", // indigo-500
            borderRightColor: "#EC4899", // pink-500
            borderBottomColor: "#A855F7", // purple-500
            borderLeftColor: "#3B82F6", // blue-500
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Optional shimmer loading text */}
      <motion.p
        className="mt-6 text-lg font-medium text-indigo-700"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};
