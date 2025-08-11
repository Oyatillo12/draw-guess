import { motion } from "framer-motion";
import { LobbyHeader } from "./ui/LobbyHeader";
import { useState } from "react";
import { containerVariants } from "./config/variants";
import { Tabs } from "@/shared/components";
import { LobbyTabKeys, tabs } from "./config/constants";
import { LobbyFooter } from "./ui/LobbyFooter";
import { PlayerNameInput } from "./ui/PlayerNameInput";

export function Lobby() {
  const [activeKey, setActiveKey] = useState(LobbyTabKeys.Create);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-8 relative z-10 border border-white/20"
      >
        <LobbyHeader />

        <PlayerNameInput />

        <Tabs activeKey={activeKey} onChange={setActiveKey} tabs={tabs} />

        <LobbyFooter />
      </motion.div>
    </div>
  );
}
