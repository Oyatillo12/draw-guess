import { Button } from "@/shared/components";
import { useGameStore } from "@/shared/game.store";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type JoinFormValues = {
  roomCode: string;
};

export const JoinTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { player } = useGameStore(
    useShallow((state) => ({
      player: state.player,
    }))
  );

  const { register, handleSubmit, watch } = useForm<JoinFormValues>();

  const hasName = !!player?.name.trim();
  const roomCodeValue = watch("roomCode", "");

  const onSubmit = async ({ roomCode }: JoinFormValues) => {
    if (!hasName || !roomCode.trim()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate(`/room/${roomCode}`);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to join room:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label
          htmlFor="room-code"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Room Code
        </label>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-green-500 transition-colors">
            🔑
          </span>
          <input
            id="room-code"
            type="text"
            placeholder="Enter room code"
            maxLength={6}
            className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-center text-lg font-mono tracking-widest"
            {...register("roomCode")}
          />
        </div>
      </div>

      <div className="mb-4 flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <span className="text-2xl">👥</span>
        <p className="text-gray-700 leading-relaxed">
          Join an existing room with the code provided by your friend! Make sure
          you have the correct room code.
        </p>
      </div>

      <Button
        type="submit"
        loading={isLoading}
        disabled={!hasName || !roomCodeValue.trim() || isLoading}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
      >
        Join Room
      </Button>
    </form>
  );
};
