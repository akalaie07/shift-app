// src/Calendar.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  format,
} from "date-fns";
import useIsMobile from "../hooks/useIsMobile";

export default function Calendar({ shifts }) {
  const [view, setView] = useState(localStorage.getItem("calendarView") || "grid");
  const [currentMonthStart, setMonthStart] = useState(new Date());
  const [showLegend, setShowLegend] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const isMobile = useIsMobile();
  const today = new Date();

  const shiftsForDay = (day) =>
    shifts.filter((s) => isSameDay(parseISO(s.start), day));

  const handleSetView = (newView) => {
    setView(newView);
    localStorage.setItem("calendarView", newView);
  };

  // === 1. GRID ===
  const renderGrid = () => {
    const monthStart = startOfMonth(currentMonthStart);
    const monthEnd = endOfMonth(currentMonthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const now = new Date();
    const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const futureShifts = shifts
      .filter((s) => !s.end && parseISO(s.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const nextShift = futureShifts[0];

    return (
      <div className="mb-6 overflow-hidden relative">
        {/* Monatsnavigation */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2 relative">
          <button
            onClick={() => setMonthStart(addMonths(monthStart, -1))}
            className="bg-red-600 text-white px-4 py-2 rounded md:hover:bg-red-700"
          >
            {isMobile ? "←" : "← Vorheriger Monat"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-red-700 dark:text-red-400">
              {format(monthStart, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-gray-500 dark:text-gray-300 md:hover:text-gray-800 dark:md:hover:text-gray-100"
              title="Legende anzeigen"
            >
              ℹ️
            </button>
          </div>
          <button
            onClick={() => setMonthStart(addMonths(monthEnd, 1))}
            className="bg-red-600 text-white px-4 py-2 rounded md:hover:bg-red-700"
          >
            {isMobile ? "→" : "Nächster Monat →"}
          </button>
        </div>

        {/* Legende */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 
                         border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3 text-left z-20 w-64"
            >
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Legende</h3>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li><span className="inline-block w-3 h-3 bg-gray-200 mr-2 rounded-sm"></span> Vergangene Schicht</li>
                <li><span className="inline-block w-3 h-3 bg-yellow-200 mr-2 rounded-sm"></span> Kommende Schicht</li>
                <li><span className="inline-block w-3 h-3 bg-green-200 mr-2 rounded-sm"></span> Nächste Schicht</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-0.5 text-center font-semibold text-red-700 dark:text-red-400 mb-1">
          {weekdays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const dayShifts = shiftsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-24 sm:min-h-32 flex flex-col justify-start p-1 rounded-lg text-center border transition cursor-pointer
                  ${isCurrentMonth 
                    ? "bg-white dark:bg-gray-900" 
                    : "bg-gray-200 text-gray-400"} 
                  ${isToday ? "border-2 border-red-500" : "border-gray-200 dark:border-gray-700"}
                  md:hover:bg-gray-100 dark:md:hover:bg-gray-800`}
              >
                {/* Datum */}
                <div className={`font-semibold ${isToday ? "bg-red-100 dark:bg-red-900 px-2 rounded-full" : ""} text-red-700 dark:text-red-400`}>
                  {format(day, "d")}
                </div>

                {/* Mobile: Punkte */}
                {isMobile ? (
                  <div className="flex justify-center gap-2 mt-1">
                    {dayShifts.map((shift) => {
                      let color = "bg-yellow-200"; // Kommende Schicht
                      if (shift.end || parseISO(shift.start) < today) color = "bg-gray-200"; // Vergangen
                      if (nextShift && shift.id === nextShift.id) color = "bg-green-200"; // Nächste
                      return <span key={shift.id} className={`w-3 h-3 rounded-full ${color}`}></span>;
                    })}
                  </div>
                ) : (
                  /* Desktop: Uhrzeiten */
                  <div className="flex flex-col gap-2 mt-2 text-sm">
                    {dayShifts.map((shift) => {
                      const start = parseISO(shift.start);
                      let classes =
                        "rounded px-2 py-1 text-center border text-base font-medium";

                      if (shift.end || start < today) {
                        classes += " bg-gray-200 text-gray-700 border-gray-400";
                      } else if (nextShift && shift.id === nextShift.id) {
                        classes += " bg-green-200 text-green-900 border-green-500";
                      } else {
                        classes += " bg-yellow-200 text-yellow-900 border-yellow-500";
                      }

                      return (
                        <div key={shift.id} className={classes}>
                          {format(start, "HH:mm")}
                          {shift.end && ` - ${format(parseISO(shift.end), "HH:mm")}`}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // === 2. AGENDA ===
  const renderAgenda = () => {
    const now = new Date();
    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => addDays(today, i));
    const futureShifts = shifts
      .filter((s) => !s.end && parseISO(s.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const nextShift = futureShifts[0];

    return (
      <div className="mb-6 relative">
        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 text-center">
            Kommende 30 Tage
          </h2>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            title="Legende anzeigen"
          >
            ℹ️
          </button>
          <AnimatePresence>
            {showLegend && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 right-0 bg-white dark:bg-gray-900 
                           border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3 text-left z-20 w-64"
              >
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Legende</h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li><span className="inline-block w-3 h-3 bg-gray-200 mr-2 rounded-sm"></span> Vergangene Schicht</li>
                  <li><span className="inline-block w-3 h-3 bg-yellow-200 mr-2 rounded-sm"></span> Kommende Schicht</li>
                  <li><span className="inline-block w-3 h-3 bg-green-200 mr-2 rounded-sm"></span> Nächste Schicht</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="space-y-3">
          {days.map((day) => {
            const dayShifts = shiftsForDay(day);
            const isToday = isSameDay(day, today);
            const isNext = nextShift && dayShifts.some((s) => s.id === nextShift.id);

            return (
              <div
                key={day}
                className={`p-3 rounded-lg border shadow-sm transition
                  ${isToday ? "border-red-500 bg-red-50 dark:bg-red-900" : "border-gray-200 dark:border-gray-700"}
                  ${isNext ? "ring-2 ring-green-500" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${isToday ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {isToday ? "Heute" : format(day, "EEEE, dd.MM.yyyy")}
                  </span>
                  {isNext && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                      Nächste Schicht
                    </span>
                  )}
                </div>
                {dayShifts.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    {dayShifts.map((shift) => {
                      const start = parseISO(shift.start);
                      let classes =
                        "flex items-center gap-2 text-sm px-2 py-1 rounded border";

                      if (shift.end || start < today) {
                        classes += " bg-gray-200 dark:bg-gray-700 text-gray-600 border-gray-400";
                      } else if (nextShift && shift.id === nextShift.id) {
                        classes += " bg-green-200 text-green-800 border-green-500";
                      } else {
                        classes += " bg-yellow-200 text-yellow-800 border-yellow-500";
                      }

                      return (
                        <li key={shift.id} className={classes}>
                          🕒 {format(parseISO(shift.start), "HH:mm")}
                          {shift.end && ` - ${format(parseISO(shift.end), "HH:mm")}`}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-400 italic">Keine Schicht</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Ansicht Switch */}
      <div className="flex justify-center gap-3 mb-6">
        <button onClick={() => handleSetView("grid")} className={`px-3 py-1 rounded ${view === "grid" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
          Monat (Grid)
        </button>
        <button onClick={() => handleSetView("agenda")} className={`px-3 py-1 rounded ${view === "agenda" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
          Monat (Agenda)
        </button>
      </div>

      {/* Render je nach Ansicht */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === "grid" && renderGrid()}
          {view === "agenda" && renderAgenda()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
