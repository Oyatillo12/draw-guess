import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/shared/types";
import { getMessageIcon, getMessageStyle } from "../../lib/chat-utils";
import { Button } from "@/shared/components";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Chat({
  messages,
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;

    onSendMessage(text);
    setInput("");
  }

  return (
    <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex flex-col h-80">
      {/* Chat header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-lg">💬</div>
        <div className="font-semibold text-gray-800">Chat</div>
        {disabled && (
          <div className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            Disabled
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-auto mb-3 space-y-2 bg-white rounded-xl p-3 border border-gray-200">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2 ${getMessageStyle(
                message.type
              )}`}
            >
              <span className="text-xs mt-0.5">
                {getMessageIcon(message.type)}
              </span>
              <div className="flex-1">
                {message.type === "chat" && message.name && (
                  <span className="font-semibold text-indigo-600 mr-2">
                    {message.name}:
                  </span>
                )}
                <span>{message.message}</span>
                {message.score && (
                  <span className="ml-2 text-xs text-green-600">
                    (+{message.score} pts)
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        />
        <Button type="submit" disabled={!input.trim() || disabled}>
          <span>📤</span>
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
