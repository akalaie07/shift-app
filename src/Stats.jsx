// src/Stats.jsx
import React, { useState, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  differenceInMinutes,
  format,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}min`;
}

function getDurationMinutes(shift, now = new Date()) {
  try {
    if (shift.durationMinutes != null) return Number(shift.durationMinutes);
    const start = shift.actualStart ? parseISO(shift.actualStart) : (shift.start ? parseISO(shift.start) : null);
    let end = null;
    if (shift.end) end = parseISO(shift.end);
    else if (shift.running) end = now;
    if (!start || !end) return 0;
    const pause = Number(shift.pauseMinutes || 0);
    return Math.max(differenceInMinutes(end, start) - pause, 0);
  } catch (e) {
    return 0;
  }
}

export default function Stats({ shifts }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weekMinutes = shifts.reduce((acc, s) => {
    try {
      if (!s.start) return acc;
      const start = parseISO(s.start);
      if (isWithinInterval(start, { start: weekStart, end: weekEnd })) {
        return acc + getDurationMinutes(s, now);
      }
    } catch (e) {}
    return acc;
  }, 0);

  const monthMinutes = shifts.reduce((acc, s) => {
    try {
      if (!s.start) return acc;
      const start = parseISO(s.start);
      if (isWithinInterval(start, { start: monthStart, end: monthEnd })) {
        return acc + getDurationMinutes(s, now);
      }
    } catch (e) {}
    return acc;
  }, 0);

  const finished = shifts.filter(s => getDurationMinutes(s, now) > 0);
  const totalMinutesAll = finished.reduce((a, s) => a + getDurationMinutes(s, now), 0);
  const avgPerShift = finished.length ? Math.round(totalMinutesAll / finished.length) : 0;

  // Umschalter (week / month)
  const [view, setView] = useState("week");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Daten für Chart
  let chartData = [];
  if (view === "week") {
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      const minutes = shifts.reduce((acc, s) => {
        try {
          if (!s.start) return acc;
          const start = parseISO(s.start);
          if (isWithinInterval(start, { start: day, end: new Date(day.getTime() + 24*60*60*1000 - 1) })) {
            return acc + getDurationMinutes(s, now);
          }
        } catch (e) {}
        return acc;
      }, 0);
      return { label: format(day, "EEE"), minutes };
    });
  } else {
    chartData = Array.from({ length: new Date(monthEnd).getDate() }).map((_, i) => {
      const day = new Date(monthStart.getTime() + i * 24 * 60 * 60 * 1000);
      const minutes = shifts.reduce((acc, s) => {
        try {
          if (!s.start) return acc;
          const start = parseISO(s.start);
          if (isWithinInterval(start, { start: day, end: new Date(day.getTime() + 24*60*60*1000 - 1) })) {
            return acc + getDurationMinutes(s, now);
          }
        } catch (e) {}
        return acc;
      }, 0);
      return { label: format(day, "d"), minutes };
    });
  }

  return (
    <div className="mt-6">
      {/* Statistiken */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Diese Woche</div>
          <div className="text-2xl font-bold text-red-700 mt-2">{formatMinutes(weekMinutes)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Dieser Monat</div>
          <div className="text-2xl font-bold text-red-700 mt-2">{formatMinutes(monthMinutes)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Durchschnitt / Schicht</div>
          <div className="text-2xl font-bold text-red-700 mt-2">{avgPerShift ? formatMinutes(avgPerShift) : "—"}</div>
        </motion.div>
      </div>

      {/* Umschalter */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setView("week")}
          className={`px-4 py-2 rounded-lg ${view === "week" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"} transition`}
        >
          Aktuelle Woche
        </button>
        {!isMobile && (
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-lg ${view === "month" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"} transition`}
          >
            Aktueller Monat
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow mt-4 h-60">
        <div className="text-sm text-gray-500 mb-2">
          {view === "week" ? "Diese Woche (Tage)" : "Dieser Monat (Tage)"}
        </div>
        <div className="flex items-end gap-2 h-32 overflow-x-auto">
          <AnimatePresence>
            {chartData.map((d, idx) => {
              const pct = Math.min(100, Math.round((d.minutes / (60 * 12)) * 100)); // max ~12h Skala
              const height = Math.max(4, pct);
              return (
                <motion.div
                  key={d.label + idx}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${height}%`, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-red-700 to-red-400 rounded-t"
                  title={`${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m`}
                >
                  <div className="text-xs text-center mt-1">{d.label}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
