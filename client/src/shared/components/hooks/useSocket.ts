import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL || "http://localhost:3001";
    const socket = io(url);
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      socketRef.current?.on(event, callback);
    },
    []
  );

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      socketRef.current?.off(event, callback);
    },
    []
  );

  return { emit, on, off, socket: socketRef.current, socketRef };
}
