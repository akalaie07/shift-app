// src/components/Toast.jsx

import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message, type = "info" }) {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white ${colors[type]} z-50`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
