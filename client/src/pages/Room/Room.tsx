import { AnimatePresence, motion } from "framer-motion";
import { Canvas } from "./ui/Canvas";
import { RoomHeader } from "./ui/RoomHeader";
import { PlayerList } from "./ui/PlayersList";
import { Chat } from "./ui/Chat";
import { WordChooser } from "./ui/WordChooser";
import { useNavigate, useParams } from "react-router-dom";
import useSocket from "@/shared/hooks/useSocket";
import { useRoomStore } from "./model/room.store";
import { GameEndScreen } from "./ui/GameEnd/GameEnd";
import { ChatType, GamePhase } from "@/shared/constants";
import { useGameStore } from "@/shared/game.store";
import { useShallow } from "zustand/shallow";
import { useEffect, useMemo } from "react";
import type { Player } from "@/shared/types";
import { MAX_ROUNDS } from "./constants";
import type { JoinRoomResponse } from "./model/types";
import { useSEO } from "../../shared/hooks/useSeo";

export const Room = () => {
  const { code } = useParams();
  const roomCode = code || "";
  const { socketRef } = useSocket();
  const navigate = useNavigate();

  const playerName = useGameStore((state) => state.player?.name ?? "");
  const {
    players,
    drawerId,
    playerId,
    phase,
    messages,
    chooseWords,
    wordForMe,
    timer,
    gameEnded,
    winner,
    finalScores,
    setState,
  } = useRoomStore(
    useShallow((state) => ({
      players: state.players,
      drawerId: state.drawerId,
      playerId: state.playerId,
      phase: state.phase,
      messages: state.messages,
      chooseWords: state.chooseWords,
      wordForMe: state.wordForMe,
      timer: state.timer,
      gameEnded: state.gameEnded,
      winner: state.winner,
      finalScores: state.finalScores,
      setState: state.setState,
    }))
  );

  useSEO({
    title: "Draw & Guess Room – Play with Friends in Real-Time!",
    description:
      "Join a live Draw & Guess room and challenge friends! Draw, guess, and have fun together. No downloads needed – play instantly!",
    url: `https://draw-guess-pied.vercel.app/room/${roomCode}`,
  });

  const currentPlayerId = playerId || socketRef.current?.id || "";

  const joinRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket?.emit(
      "joinRoom",
      { code: roomCode, name: playerName },
      (res: JoinRoomResponse) => {
        if (res?.error) {
          alert(res.error);

          navigate("/", { replace: true });

          return;
        }
      }
    );
  };

  const handleConnect = () => {
    setState({ isConnected: true, playerId: currentPlayerId || "" });
    joinRoom();
    console.log("Connected to the server");
  };

  const handleDisconnect = () => {
    setState({ isConnected: false });
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }
    socket.on("disconnect", handleDisconnect);

    socket.on("updatePlayers", (players: Player[]) => {
      console.log(players);
      setState({ players });
    });

    socket.on("roomState", (state) =>
      setState({
        players: state.players || [],
        drawerId: state.drawerId,
        phase: state.phase || GamePhase.Waiting,
        round: state.round || 0,
        maxRounds: state.maxRounds || 5,
      })
    );

    socket.on("roundStart", (payload: any) => {
      console.log("Round started:", payload);
      setState((state) => ({
        drawerId: payload?.drawerId,
        phase: payload.phase || GamePhase.Choosing,
        round: payload.round,
        wordForMe: undefined,
        maxRounds: payload?.maxRounds || MAX_ROUNDS,
        messages: [
          ...(state?.messages ?? []),
          {
            id: "sys-" + Date.now(),
            message: `🎯 Round ${payload.round} started! ${
              payload.drawerId === socket.id
                ? "You're drawing!"
                : "Get ready to guess!"
            }`,
            type: ChatType.System,
          },
        ],
      }));
    });

    socket.on("chooseWord", ({ words }) =>
      setState({ chooseWords: words, phase: GamePhase.Choosing })
    );

    socket.on("yourWord", ({ word }) => setState({ wordForMe: word }));

    socket.on("drawingStart", () =>
      setState((state) => ({
        phase: GamePhase.Drawing,
        messages: [
          ...(state?.messages ?? []),
          {
            id: "sys-" + Date.now(),
            message: "🎨 Drawing started!",
            type: ChatType.System,
          },
        ],
      }))
    );
    socket.on("timer", (t) => setState({ timer: t }));

    socket.on("roundEnd", ({ word, scores, guessedPlayers }) => {
      console.log("Round ended:", { word, guessedPlayers, scores });
      const guessedCount = guessedPlayers?.length || 0;

      setState((state) => ({
        phase: GamePhase.RoundEnd,
        messages: [
          ...(state?.messages ?? []),
          {
            id: "roundEnd-" + Date.now(),
            message: `🏁 Round ended! The word was "${word}". ${guessedCount} player${
              guessedCount !== 1 ? "s" : ""
            } guessed correctly!`,
            type: ChatType.RoundEnd,
          },
        ],
        wordForMe: undefined,
        chooseWords: undefined,
        players: scores || state.players,
      }));
    });

    socket.on("chat", (m) =>
      setState((state) => ({
        messages: [
          ...(state?.messages ?? []),
          { id: m.id || "chat-" + Date.now(), ...m },
        ],
      }))
    );

    socket.on("correctGuess", (data) =>
      setState((state) => ({
        messages: [
          ...(state?.messages ?? []),
          {
            id: "correct-" + Date.now(),
            message: `✅ ${data.name} guessed correctly! (+${data.score} points)`,
            type: ChatType.Correct,
            score: data.score,
            timeLeft: data.timeLeft,
          },
        ],
      }))
    );

    socket.on("gameEnd", (data) =>
      setState({
        gameEnded: true,
        winner: data.winner,
        finalScores: data.finalScores,
        phase: GamePhase.Waiting,
      })
    );

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

    socket.emit("chooseWord", { code: roomCode, word });
    setState({ chooseWords: undefined });
  }

  function sendMessage(message: string) {
    if (!socketRef.current) {
      console.error("Socket not connected");
      return;
    }
    socketRef.current.emit("guess", {
      code: roomCode,
      guess: message,
    });
  }

  const drawer = useMemo(
    () => players.find((p) => p.id === drawerId),
    [players, drawerId]
  );

  const isChatDisabled = useMemo(
    () => phase === GamePhase.Choosing || phase === GamePhase.RoundEnd,
    [phase]
  );

  const chatPlaceholder = useMemo(() => {
    switch (phase) {
      case GamePhase.Choosing:
        return "Waiting for drawer to pick a word...";
      case GamePhase.Drawing:
        return "Type your guess...";
      default:
        return "Chat is disabled";
    }
  }, [phase]);

  const isDrawer = currentPlayerId === drawerId;

  if (!playerName) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Joining room...
      </div>
    );
  }

  if (gameEnded) {
    return (
      <GameEndScreen
        gameEndData={{ finalScores, winner }}
        currentPlayerId={currentPlayerId}
      />
    );
  }

  return (
    <>
      {gameEnded ? (
        <GameEndScreen
          gameEndData={{ finalScores, winner }}
          currentPlayerId={currentPlayerId}
        />
      ) : (
        <div className="flex gap-4 p-4 h-screen bg-gradient-to-br from-indigo-50 to-pink-50">
          {/* Main canvas area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden">
            <RoomHeader
              roomCode={roomCode}
              drawerName={drawer?.name ?? ""}
              isDrawer={isDrawer}
            />

            {/* Canvas */}
            <div className="flex-1 p-2 sm:p-4">
              <Canvas
                socket={socketRef.current}
                roomCode={roomCode}
                drawerId={drawerId}
                playerId={currentPlayerId}
                phase={phase}
              />
            </div>

            {/* Drawer / watcher banners */}
            <div className="px-4 sm:px-6 pb-4">
              <AnimatePresence>
                {isDrawer && wordForMe ? (
                  <motion.div
                    key="drawer-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg border border-yellow-200 text-sm sm:text-base"
                  >
                    ✏️ You are drawing:
                    <span className="font-bold text-lg ml-2 text-yellow-900">
                      {wordForMe}
                    </span>
                  </motion.div>
                ) : drawer && phase === GamePhase.Drawing ? (
                  <motion.div
                    key="watcher-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg border border-blue-200 text-sm sm:text-base"
                  >
                    ✏️ {drawer.name} is drawing... Start guessing!
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Right sidebar: players, chat, input */}
          <div className="w-full md:w-96 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
            {/* Players */}
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="text-base sm:text-lg font-semibold text-gray-800">
                  Players ({players.length})
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  Score
                </div>
              </div>
            </div>

            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              drawerId={drawerId}
            />

            <Chat
              messages={messages}
              onSendMessage={sendMessage}
              disabled={isChatDisabled}
              placeholder={chatPlaceholder}
            />
          </div>

          {/* Only show word chooser if there are words to choose */}
          {chooseWords && (
            <WordChooser
              words={chooseWords}
              timer={timer}
              onChooseWord={chooseWord}
            />
          )}
        </div>
      )}
    </>
  );
};
