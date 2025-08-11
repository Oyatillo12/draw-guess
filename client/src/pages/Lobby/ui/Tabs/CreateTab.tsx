import { Button } from "@/shared/components";
import { useGameStore } from "@/shared/game.store";
import useSocket from "@/shared/hooks/useSocket";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import type { CreateRoomRes } from "../../model/lobby.types";
import { useNavigate } from "react-router-dom";

export const CreateTab = () => {
  const { emit } = useSocket();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { player } = useGameStore(
    useShallow((state) => ({
      player: state.player,
    }))
  );

  const createRoom = async () => {
    if (!player?.name?.trim()) return;

    setIsLoading(true);

    try {
      emit("createRoom", null, (res: CreateRoomRes) => {
        if (res.code) {
          navigate(`/room/${res.code}`);
        }
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <span className="text-2xl">🎯</span>
        <p className="text-gray-700 leading-relaxed">
          Create a new room and invite friends to play together! Share the room
          code with your friends to get started.
        </p>
      </div>

      <Button onClick={createRoom} disabled={isLoading} loading={isLoading}>
        Create New Room
      </Button>
    </>
  );
};
