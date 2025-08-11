import { motion } from "framer-motion";
import { itemVariants } from "../config/variants";

export const LobbyHeader = () => {
  return (
    <motion.div variants={itemVariants} className="text-center space-y-4">
      <motion.div
        className="flex items-center justify-center text-5xl mb-2"
        animate={{
          rotate: [0, -10, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        🎨
      </motion.div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Draw & Guess
      </h1>

      <p className="text-gray-600 text-lg">
        Create or join a room to start playing!
      </p>
    </motion.div>
  );
};
