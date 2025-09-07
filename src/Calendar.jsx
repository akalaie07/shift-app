// src/Calendar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  format,
} from "date-fns";

export default function Calendar({ shifts, currentMonthStart, setMonthStart }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const monthStart = startOfMonth(currentMonthStart);
  const monthEnd = endOfMonth(currentMonthStart);

  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const now = new Date();

  // Filter die nächste kommende Schicht
  const futureShifts = shifts
    .filter(s => !s.end && parseISO(s.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextShift = futureShifts[0];

  const shiftsForDay = (day) => shifts.filter((s) => isSameDay(parseISO(s.start), day));
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="mb-6 overflow-hidden relative">
      {/* Monatsnavigation + Info */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2 relative">
        <button
          onClick={() => setMonthStart(addDays(monthStart, -1))}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {isMobile ? "←" : "← Vorheriger Monat"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-red-700">
            {format(monthStart, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-gray-500 hover:text-gray-800"
            title="Legende anzeigen"
          >
            ℹ️
          </button>
        </div>
        <button
          onClick={() => setMonthStart(addDays(monthEnd, 1))}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {isMobile ? "→" : "Nächster Monat →"}
        </button>

        {/* Legende Popup */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border rounded shadow-lg p-3 text-left z-20 w-64"
            >
              <h3 className="font-semibold text-red-700 mb-2">Legende</h3>
              <ul className="text-sm space-y-1">
                <li><span className="inline-block w-3 h-3 bg-gray-200 mr-2 rounded-sm"></span> Vergangene Schicht</li>
                <li><span className="inline-block w-3 h-3 bg-yellow-200 mr-2 rounded-sm"></span> Kommende Schicht</li>
                <li><span className="inline-block w-3 h-3 bg-green-200 mr-2 rounded-sm"></span> Nächste Schicht</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-red-700 mb-1">
        {weekdays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Grid-Tage */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayShifts = shiftsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={day}
              className={`p-2 rounded-lg text-center border ${
                isCurrentMonth ? "bg-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              <div className="font-semibold text-red-700">{format(day, "d")}</div>
              {dayShifts.map((shift) => {
                let bg = "bg-yellow-200 text-yellow-800"; // Zukunft
                if (shift.end || parseISO(shift.start) < now) bg = "bg-gray-200 text-gray-600"; // Vergangenheit
                if (nextShift && shift.id === nextShift.id) bg = "bg-green-200 text-green-800"; // Nächste Schicht

                return (
                  <div
                    key={shift.id}
                    className={`text-sm rounded px-1 py-0.5 mt-1 ${bg}`}
                  >
                    {format(parseISO(shift.start), "HH:mm")}
                    {shift.end && <> - {format(parseISO(shift.end), "HH:mm")}</>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
