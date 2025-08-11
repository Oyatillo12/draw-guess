import { itemVariants } from "@/shared/motion-variants";
import { motion } from "framer-motion";
import { features } from "../config/constants";

export const LobbyFooter = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="flex justify-center gap-8 text-gray-500 text-sm border-t border-gray-200 pt-6"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-lg">{feature.icon}</span>
          <span className="font-medium">{feature.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};
