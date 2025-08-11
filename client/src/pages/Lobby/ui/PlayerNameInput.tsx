import { motion } from "framer-motion";
import { itemVariants } from "../config/variants";
import { useGameStore } from "@/shared/game.store";
import { useShallow } from "zustand/shallow";

export const PlayerNameInput = () => {
  const { player, setPlayer } = useGameStore(
    useShallow((state) => ({
      player: state.player,
      setPlayer: state.setPlayer,
    }))
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer({
      ...player,
      name: e.target.value,
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <label
        htmlFor="player-name"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Your Name
      </label>
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          👤
        </span>
        <input
          id="player-name"
          type="text"
          value={player.name}
          onChange={handleNameChange}
          placeholder="Enter your name"
          maxLength={20}
          className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
        />
      </div>
    </motion.div>
  );
};
