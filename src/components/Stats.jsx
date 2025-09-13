// src/Stats.jsx
import React, { useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import formatMinutes from "../utils/formatMinutes";
import { getDurationMinutes } from "../utils/shiftUtils";
import useIsMobile from "../hooks/useIsMobile";

export default function Stats({ shifts }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [view, setView] = useState("week");
  const isMobile = useIsMobile();

  const weekMinutes = shifts.reduce((acc, s) => {
    try {
      if (!s.start) return acc;
      const start = parseISO(s.start);
      if (start >= weekStart && start <= endOfWeek(weekStart, { weekStartsOn: 1 })) {
        return acc + getDurationMinutes(s, now);
      }
    } catch {}
    return acc;
  }, 0);

  const monthMinutes = shifts.reduce((acc, s) => {
    try {
      if (!s.start) return acc;
      const start = parseISO(s.start);
      if (start >= monthStart && start <= monthEnd) {
        return acc + getDurationMinutes(s, now);
      }
    } catch {}
    return acc;
  }, 0);

  const finished = shifts.filter((s) => getDurationMinutes(s, now) > 0);
  const totalMinutesAll = finished.reduce((a, s) => a + getDurationMinutes(s, now), 0);
  const avgPerShift = finished.length ? Math.round(totalMinutesAll / finished.length) : 0;

  // Chartdaten
  const maxMinutes = 210;
  const containerHeight = 256;

  let chartData = [];
  if (view === "week") {
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = day;
      const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      const minutes = shifts.reduce((acc, s) => {
        try {
          if (!s.start) return acc;
          const start = parseISO(s.start);
          const end = s.end ? parseISO(s.end) : s.running ? new Date() : null;
          if (!end) return acc;
          const pause = Number(s.pauseMinutes || 0);
          if (start >= dayStart && start < dayEnd) {
            const duration = Math.round((end.getTime() - start.getTime()) / 60000) - pause;
            return acc + Math.max(duration, 0);
          }
        } catch {}
        return acc;
      }, 0);
      return { label: format(day, "EEE"), minutes };
    });
  } else {
    chartData = Array.from({ length: new Date(monthEnd).getDate() }).map((_, i) => {
      const day = new Date(monthStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = day;
      const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      const minutes = shifts.reduce((acc, s) => {
        try {
          if (!s.start) return acc;
          const start = parseISO(s.start);
          const end = s.end ? parseISO(s.end) : s.running ? new Date() : null;
          if (!end) return acc;
          const pause = Number(s.pauseMinutes || 0);
          if (start >= dayStart && start < dayEnd) {
            const duration = Math.round((end.getTime() - start.getTime()) / 60000) - pause;
            return acc + Math.max(duration, 0);
          }
        } catch {}
        return acc;
      }, 0);
      return { label: format(day, "d"), minutes };
    });
  }

  return (
    <div className="mt-6">
      {/* Statistiken */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          whileHover={isMobile ? {} : { scale: 1.05 }}
          className="bg-white dark:bg-gray-900 p-4 rounded shadow border border-gray-200 dark:border-gray-700 
                     md:hover:border-white dark:md:hover:border-white transition"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Diese Woche</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
            {formatMinutes(weekMinutes)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={isMobile ? {} : { scale: 1.05 }}
          className="bg-white dark:bg-gray-900 p-4 rounded shadow border border-gray-200 dark:border-gray-700 
                     md:hover:border-white dark:md:hover:border-white transition"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Dieser Monat</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
            {formatMinutes(monthMinutes)}
          </div>
        </motion.div>

        <motion.div
          whileHover={isMobile ? {} : { scale: 1.05 }}
          className="bg-white dark:bg-gray-900 p-4 rounded shadow border border-gray-200 dark:border-gray-700 
                     md:hover:border-white dark:md:hover:border-white transition"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Durchschnitt / Schicht</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
            {avgPerShift ? formatMinutes(avgPerShift) : "—"}
          </div>
        </motion.div>
      </div>

      {/* Umschalter */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setView("week")}
          className={`px-4 py-2 rounded-lg transition-colors duration-300 
            ${view === "week" 
              ? "bg-red-600 text-white dark:bg-red-500 md:hover:bg-red-700 dark:md:hover:bg-red-600" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
        >
          Aktuelle Woche
        </button>
        {!isMobile && (
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 
              ${view === "month" 
                ? "bg-red-600 text-white dark:bg-red-500 md:hover:bg-red-700 dark:md:hover:bg-red-600" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
          >
            Aktueller Monat
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow mt-4 h-64 flex relative 
                      border border-gray-200 dark:border-gray-700
                      text-gray-800 dark:text-gray-200 transition-colors duration-500">
        <div className="flex items-end gap-2 flex-1 h-full z-10">
          <AnimatePresence>
            {chartData.map((d, idx) => {
              const barHeight = Math.round((d.minutes / maxMinutes) * containerHeight);

              let bgColor = "rgb(254,202,202)";
              if (d.minutes > 150) bgColor = "rgb(185,28,28)";
              else if (d.minutes > 90) bgColor = "rgb(220,38,38)";

              return (
                <motion.div
                  key={d.label + idx}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${barHeight}px`, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 rounded-t relative"
                  style={{ backgroundColor: bgColor, cursor: "pointer" }}
                  whileHover={{ scale: 1.05 }}
                  title={d.minutes > 0 ? `${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m` : "Keine Schicht"}
                >
                  {d.minutes > 0 && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs 
                                    text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">
                      {formatMinutes(d.minutes)}
                    </div>
                  )}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs 
                                  text-gray-700 dark:text-gray-300">
                    {d.label}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
