import { MAX_ROUNDS, PHASE_DISPLAY_NAMES } from "../../constants";
import { useRoomStore } from "../../model/room.store";
import { useShallow } from "zustand/shallow";

type RoomHeaderProps = {
  roomCode: string;
  drawerName?: string;
  isDrawer: boolean;
};

export const RoomHeader = ({
  roomCode,
  drawerName,
  isDrawer,
}: RoomHeaderProps) => {
  const { isConnected, phase, round, timer } = useRoomStore(
    useShallow((state) => ({
      phase: state.phase,
      round: state.round,
      timer: state.timer,
      isConnected: state.isConnected,
    }))
  );

  return (
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
            {round} / {MAX_ROUNDS}
          </div>
        </div>
        <div className="ml-6">
          <div className="text-sm text-gray-600 font-medium">Status</div>
          <div className="font-semibold text-gray-800">
            {PHASE_DISPLAY_NAMES[phase]}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isConnected && (
          <div className="text-red-500 text-sm font-medium">
            🔴 Connecting...
          </div>
        )}

        {drawerName && (
          <div className="text-right">
            <div className="text-sm text-gray-600 font-medium">
              Current Drawer
            </div>
            <div className="font-semibold text-gray-800">
              {isDrawer ? "You" : drawerName}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-lg">
          {timer !== undefined ? `${timer}s` : "--"}
        </div>
      </div>
    </div>
  );
};
