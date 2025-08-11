import type { GameEndData } from "@/shared/types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface GameEndScreenProps {
  gameEndData: GameEndData;
  currentPlayerId: string;
}

export const GameEndScreen = ({
  gameEndData,
  currentPlayerId,
}: GameEndScreenProps) => {
  const navigate = useNavigate();

  const handleNavigateRoot = () => navigate("/");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h1>
          <p className="text-gray-600">Thanks for playing!</p>
        </div>

        {gameEndData.winner && (
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-4xl mb-2">👑</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-1">
              {gameEndData.winner.name} wins!
            </h2>
            <p className="text-yellow-700 font-semibold">
              Final Score: {gameEndData.winner.score} points
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Final Standings
          </h3>
          {gameEndData.finalScores.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {player.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {player.id === currentPlayerId ? "(You)" : ""}
                  </div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {player.score}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleNavigateRoot}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          🎮 Play Again
        </motion.button>
      </motion.div>
    </div>
  );
};
