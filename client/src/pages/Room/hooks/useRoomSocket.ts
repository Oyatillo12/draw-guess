import { useEffect } from "react";
import { useRoomStore } from "../model/room.store";
import { ChatType, GamePhase } from "@/shared/constants";
import type { Player } from "@/shared/types";
import { MAX_ROUNDS } from "../constants";
import type { Socket } from "socket.io-client";
import type { JoinRoomResponse } from "../model/types";

export const useRoomSocket = (
  socket: Socket | null,
  roomCode: string,
  playerName: string
) => {
  const setState = useRoomStore((state) => state.setState);

  const joinRoom = () => {
    socket?.emit(
      "joinRoom",
      { code: roomCode, name: playerName },
      (res: JoinRoomResponse) => {
        if (res?.error) {
          alert(res.error);
          return;
        }
      }
    );
  };

  const handleConnect = () => {
    setState({ isConnected: true, playerId: socket?.id || "" });
    joinRoom();
    console.log("Connected to the server");
  };

  const handleDisconnect = () => {
    setState({ isConnected: false });
  };

  useEffect(() => {
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
};
