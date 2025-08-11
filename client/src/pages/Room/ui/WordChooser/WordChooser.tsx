import { motion, AnimatePresence } from "framer-motion";

interface WordChooserProps {
  words?: string[];
  timer?: number;
  onChooseWord: (word: string) => void;
}

export const WordChooser = ({
  words,
  timer,
  onChooseWord,
}: WordChooserProps) => {
  if (!words) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Pick a word to draw
            </h3>
            <p className="text-gray-600">
              You have {timer} seconds to choose a word!
            </p>
          </div>
          <div className="space-y-3">
            {words.map((word) => (
              <motion.button
                key={word}
                onClick={() => onChooseWord(word)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-left font-semibold text-gray-800 transition-all duration-200"
              >
                {word}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
