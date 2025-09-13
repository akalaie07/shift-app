// src/BarChart.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BarChart({ data, maxValue, height = 32 }) {
  // maxValue dynamisch berechnen, falls nicht übergeben
  const max = maxValue || Math.max(...data.map(d => d.value), 60);

  return (
    <div className={`flex items-end gap-2 h-${height} overflow-x-auto`}>
      <AnimatePresence>
        {data.map((d, idx) => {
          const pct = Math.round((d.value / max) * 100);
          const barHeight = Math.max(5, pct); // mind. 5% sichtbar

          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              {/* Balken */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${barHeight}%`, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-gradient-to-t from-red-700 to-red-400 rounded-t"
                title={`${Math.floor(d.value / 60)}h ${d.value % 60}m`}
              />
              {/* Label immer unter dem Balken */}
              <div className="text-xs mt-1">{d.label}</div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
