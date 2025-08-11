import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@/pages/Room/ui/Canvas";
import { Chat } from "./Chat";
import { useParams } from "react-router-dom";
import useSocket from "@/shared/hooks/useSocket";
import { GamePhase } from "@/shared/constants";

type Player = { id: string; name: string; score: number; isReady: boolean };
type ChatMessage = {
  id: string;
  name?: string;
  message: string;
  type?: "chat" | "system" | "correct" | "roundEnd";
  score?: number;
  timeLeft?: number;
};

export function Room() {
  const { code } = useParams();
  const roomCode = code || "";
  const { socketRef } = useSocket();
  const [playerId, setPlayerId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [drawerId, setDrawerId] = useState<string | undefined>();
  const [phase, setPhase] = useState<GamePhase>(GamePhase.Waiting);
  const [timer, setTimer] = useState<number | undefined>();
  const [wordForMe, setWordForMe] = useState<string | undefined>();
  const [chooseWords, setChooseWords] = useState<string[] | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [round, setRound] = useState<number>(0);
  const [maxRounds, setMaxRounds] = useState<number>(5);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [finalScores, setFinalScores] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Handle connection events
    const handleConnect = () => {
      console.log("Connected to server");
      setIsConnected(true);
      setPlayerId(socket.id || "");
      joinRoom();
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    }

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }
    socket.on("disconnect", handleDisconnect);

    function joinRoom() {
      if (!socket) return;

      console.log("Joining room:", roomCode, "with name:", name);
      socket.emit("joinRoom", { code: roomCode, name }, (res: any) => {
        if (res?.error) {
          alert(res.error);
          return;
        }
        console.log("Successfully joined room");
      });
    }

    socket.on("updatePlayers", (list: Player[]) => {
      console.log("Players updated:", list);
      setPlayers(list);
    });

    socket.on("roomState", (state: any) => {
      console.log("Room state received:", state);
      setPlayers(state.players || []);
      setDrawerId(state.drawerId);
      setPhase(state.phase || "waiting");
      setRound(state.round || 0);
      setMaxRounds(state.maxRounds || 5);
    });

    socket.on("roundStart", (payload: any) => {
      console.log("Round started:", payload);
      setDrawerId(payload.drawerId);
      setPhase(payload.phase || "choosing");
      setRound(payload.round || 0);
      setMaxRounds(payload.maxRounds || 5);
      setWordForMe(undefined);
      setMessages((m) => [
        ...m,
        {
          id: "sys-" + Date.now(),
          message: `🎯 Round ${payload.round} started! ${
            payload.drawerId === socket.id
              ? "You're drawing!"
              : "Get ready to guess!"
          }`,
          type: "system",
        },
      ]);
    });

    socket.on("chooseWord", ({ words }: { words: string[] }) => {
      console.log("Choose word received:", words);
      setChooseWords(words);
      setPhase(GamePhase.Choosing);
    });

    socket.on("yourWord", ({ word }: { word: string }) => {
      console.log("Your word received:", word);
      setWordForMe(word);
    });

    socket.on("drawingStart", () => {
      console.log("Drawing phase started");
      setPhase(GamePhase.Drawing);
      setMessages((m) => [
        ...m,
        {
          id: "sys-" + Date.now(),
          message: "🎨 Drawing phase started! Start guessing!",
          type: "system",
        },
      ]);
    });

    socket.on("timer", (t: number) => {
      setTimer(t);
    });

    socket.on("roundEnd", ({ word, guessedPlayers, scores }: any) => {
      console.log("Round ended:", { word, guessedPlayers, scores });
      setPhase(GamePhase.RoundEnd);
      const guessedCount = guessedPlayers?.length || 0;

      setMessages((m) => [
        ...m,
        {
          id: "roundEnd-" + Date.now(),
          message: `🏁 Round ended! The word was "${word}". ${guessedCount} player${
            guessedCount !== 1 ? "s" : ""
          } guessed correctly!`,
          type: "roundEnd",
        },
      ]);

      setWordForMe(undefined);
      setChooseWords(undefined);

      // Update scores
      if (scores) {
        setPlayers(scores);
      }
    });

    socket.on("chat", (m: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: m.id || "chat-" + Date.now(),
          name: m.name,
          message: m.message,
          type: "chat",
        },
      ]);
    });

    socket.on("correctGuess", (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: "correct-" + Date.now(),
          message: `✅ ${data.name} guessed correctly! (+${data.score} points)`,
          type: "correct",
          score: data.score,
          timeLeft: data.timeLeft,
        },
      ]);
    });

    socket.on("gameEnd", (data: any) => {
      console.log("Game ended:", data);
      setGameEnded(true);
      setWinner(data.winner);
      setFinalScores(data.finalScores);
      setPhase(GamePhase.Waiting);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updatePlayers");
      socket.off("roomState");
      socket.off("roundStart");
      socket.off("chooseWord");
      socket.off("yourWord");
      socket.off("drawingStart");
      socket.off("timer");
      socket.off("roundEnd");
      socket.off("chat");
      socket.off("correctGuess");
      socket.off("gameEnd");
    };
  }, [roomCode]);

  function chooseWord(word: string) {
    const socket = socketRef.current;

    if (!socket) return;

    console.log("Choosing word:", word);
    socket.emit("chooseWord", { code: roomCode, word });
    setChooseWords(undefined);
  }

  const drawer = players.find((p) => p.id === drawerId);
  const isDrawer = playerId === drawerId;

  if (gameEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Game Over!
            </h1>
            <p className="text-gray-600">Thanks for playing!</p>
          </div>

          {winner && (
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 mb-6 text-center">
              <div className="text-4xl mb-2">👑</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-1">
                {winner.name} wins!
              </h2>
              <p className="text-yellow-700 font-semibold">
                Final Score: {winner.score} points
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Final Standings
            </h3>
            {finalScores.map((player, index) => (
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
                      {player.id === playerId ? "(You)" : ""}
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
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🎮 Play Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 h-screen bg-gradient-to-br from-indigo-50 to-pink-50">
      {/* Connection status */}
      {!isConnected && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          🔴 Connecting...
        </div>
      )}

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top bar: status + timer */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🎨</div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Room Code</div>
              <div className="font-bold text-xl text-indigo-700 font-mono">
                {roomCode}
              </div>
            </div>
            <div className="ml-6">
              <div className="text-sm text-gray-600 font-medium">Round</div>
              <div className="font-bold text-lg text-gray-800">
                {round} / {maxRounds}
              </div>
            </div>
            <div className="ml-6">
              <div className="text-sm text-gray-600 font-medium">Status</div>
              <div className="font-semibold text-gray-800">
                {phase === "choosing"
                  ? "🎯 Choosing Word"
                  : phase === "drawing"
                  ? "🎨 Drawing"
                  : phase === "roundEnd"
                  ? "🏁 Round End"
                  : "⏳ Waiting"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {drawer && (
              <div className="text-right">
                <div className="text-sm text-gray-600 font-medium">
                  Current Drawer
                </div>
                <div className="font-semibold text-gray-800">
                  {isDrawer ? "You" : drawer.name}
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-lg">
              {timer !== undefined ? `${timer}s` : "--"}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <Canvas
            socket={socketRef?.current}
            roomCode={roomCode}
            drawerId={drawerId}
            playerId={playerId}
            phase={phase}
          />
        </div>

        <div className="px-6 pb-4">
          <AnimatePresence>
            {playerId === drawerId && wordForMe ? (
              <motion.div
                key="drawer-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-6 py-3 rounded-xl shadow-lg border border-yellow-200"
              >
                ✏️ You are drawing:{" "}
                <span className="font-bold text-lg ml-2 text-yellow-900">
                  {wordForMe}
                </span>
              </motion.div>
            ) : drawer && phase === "drawing" ? (
              <motion.div
                key="watcher-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-3 rounded-xl shadow-lg border border-blue-200"
              >
                ✏️ {drawer.name} is drawing... Start guessing!
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Right sidebar: players, chat, input */}
      <div className="w-96 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Players */}
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-800">
              Players ({players.length})
            </div>
            <div className="text-sm font-medium text-gray-600">Score</div>
          </div>
        </div>

        <div className="px-4 py-3 flex-1 overflow-auto space-y-2">
          {players.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                p.id === drawerId
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200"
                  : p.id === playerId
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    p.id === drawerId
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : p.id === playerId
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                  }`}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    {p.id === drawerId
                      ? "🎨 Drawing"
                      : p.id === playerId
                      ? "👤 You"
                      : "👥 Player"}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700">{p.score}</div>
            </motion.div>
          ))}
        </div>

        {/* Chat area */}
        <Chat
          messages={messages}
          onSendMessage={(message) => {
            socketRef?.current?.emit("guess", {
              code: roomCode,
              guess: message,
            });
          }}
          disabled={phase === "choosing" || phase === "roundEnd"}
          placeholder={
            phase === "choosing"
              ? "Waiting for drawer to pick a word..."
              : phase === "drawing"
              ? "Type your guess..."
              : "Chat is disabled"
          }
        />
      </div>

      {/* Word chooser modal (drawer only) */}
      <AnimatePresence>
        {chooseWords && (
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
                {chooseWords.map((word) => (
                  <motion.button
                    key={word}
                    onClick={() => chooseWord(word)}
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
        )}
      </AnimatePresence>
    </div>
  );
}
