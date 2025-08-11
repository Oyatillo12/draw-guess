import type { Player } from "@/shared/types";
import { motion } from "framer-motion";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  drawerId?: string;
}

export const PlayerList = ({
  players,
  currentPlayerId,
  drawerId,
}: PlayerListProps) => {
  return (
    <div className="px-4 py-3 flex-1 overflow-auto space-y-2">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
            player.id === drawerId
              ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200"
              : player.id === currentPlayerId
              ? "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                player.id === drawerId
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                  : player.id === currentPlayerId
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-gray-400 to-gray-500"
              }`}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{player.name}</div>
              <div className="text-xs text-gray-500">
                {player.id === drawerId
                  ? "🎨 Drawing"
                  : player.id === currentPlayerId
                  ? "👤 You"
                  : "👥 Player"}
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-700">{player.score}</div>
        </motion.div>
      ))}
    </div>
  );
};
