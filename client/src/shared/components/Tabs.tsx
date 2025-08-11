import { AnimatePresence, motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import { itemVariants } from "../motion-variants";

export type Tab<K extends string> = {
  key: K;
  label: ReactNode;
  icon: ReactNode;
  content: ReactNode;
};

export type TabsProps<K extends string> = {
  tabs: Tab<K>[];
  activeKey: K;
  onChange: (key: K) => void;
};

export type TabHeaderProps<K extends string> = {
  tab: Tab<K>;
  activeKey: K;
  onClick: VoidFunction;
};

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export const TabHeader = <K extends string>({
  activeKey,
  onClick,
  tab,
}: TabHeaderProps<K>) => {
  const isActive = activeKey === tab.key;

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-white shadow-lg text-indigo-600 scale-105"
          : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
      }`}
    >
      <span className="text-lg">{tab.icon}</span>
      {tab.label}
    </button>
  );
};

export const Tabs = <K extends string>({
  activeKey,
  onChange,
  tabs,
}: TabsProps<K>) => {
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeKey),
    [activeKey, tabs]
  );

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex rounded-xl bg-gray-100 p-1.5"
      >
        {tabs.map((tab) => (
          <TabHeader
            activeKey={activeKey}
            onClick={onChange.bind(null, tab.key)}
            tab={tab}
            key={tab.key}
          />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
