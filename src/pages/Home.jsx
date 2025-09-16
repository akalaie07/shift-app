// src/Home.jsx
import React, { useState, useEffect, useMemo } from "react";
import { parseISO, differenceInMinutes, format } from "date-fns";
import { motion } from "framer-motion";

export default function Home({ shifts, onUpdate }) {
  const [now, setNow] = useState(new Date());

  // ⏰ Uhrzeit jede Sekunde aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ⏱️ Auto-Start für Schichten
  useEffect(() => {
    const updatedShifts = shifts.map((s) => {
      if (!s.running && !s.end && s.start && new Date(s.start) <= now) {
        // ✅ Startzeit übernehmen (nicht "jetzt")
        return { ...s, running: true, actualStart: s.actualStart || s.start };
      }
      return s;
    });

    if (JSON.stringify(updatedShifts) !== JSON.stringify(shifts)) {
      onUpdate(updatedShifts);
    }
  }, [now, shifts, onUpdate]);

  // 🔴 Laufende Schicht finden
  const runningShift = useMemo(
    () => shifts.find((s) => s.running && !s.end),
    [shifts]
  );

  // 🟡 Nächste Schicht finden
  const futureShifts = useMemo(
    () =>
      shifts
        .filter((s) => !s.running && !s.end && s.start && new Date(s.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [shifts, now]
  );
  const nextShift = futureShifts[0];

  // ⌛ Laufende Schicht Fortschritt
  let liveDuration = "",
    progressPercent = 0;
  if (runningShift?.actualStart) {
    const startTime = parseISO(runningShift.actualStart); // ✅ immer parseISO
    const minutesPassed = Math.floor((now - startTime) / 60000);
    const maxDuration = 180; // 3h als Beispiel
    liveDuration = `${Math.floor(minutesPassed / 60)}h ${minutesPassed % 60}min`;
    progressPercent = Math.min((minutesPassed / maxDuration) * 100, 100);
  }

  // 🔚 Schicht beenden
  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;

    if (
      !window.confirm(
        `Endzeit jetzt übernehmen? (${format(new Date(endTime), "HH:mm")})`
      )
    ) {
      const manual = prompt(
        "Endzeit eingeben (YYYY-MM-DD HH:MM):",
        format(new Date(), "yyyy-MM-dd HH:mm")
      );
      if (manual) endTime = new Date(manual.replace(" ", "T")).toISOString();
    }

    if (window.confirm("Hattest du Pause?")) {
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if (pauseInput) pauseMinutes = parseInt(pauseInput);
    }

    const updated = shifts.map((s) => {
      if (s.id === shift.id) {
        const durationMinutes = Math.max(
          differenceInMinutes(
            new Date(endTime),
            parseISO(s.actualStart || s.start)
          ) - pauseMinutes,
          0
        );
        return {
          ...s,
          end: endTime,
          pauseMinutes,
          durationMinutes,
          running: false,
        };
      }
      return s;
    });

    onUpdate(updated);
  };

  return (
    <div className="mb-6 flex justify-center">
      {runningShift ? (
        // 🔴 Laufende Schicht
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-2xl relative flex flex-col items-center"
        >
          <div className="relative w-72 h-72 mb-8">
            <svg className="w-72 h-72" viewBox="0 0 36 36">
              <path
                className="text-gray-300 dark:text-gray-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                strokeWidth="3"
                stroke="#22c55e"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100 - progressPercent}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                transition={{ ease: "linear", duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-semibold text-gray-800 dark:text-gray-200">
              <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
                Schicht läuft
              </h2>
              <p className="text-2xl">
                Gestartet: {format(parseISO(runningShift.actualStart), "HH:mm")}
              </p>
              <p className="text-2xl mt-2">Dauer: {liveDuration}</p>
            </div>
          </div>
          <button
            onClick={() => handleEnd(runningShift)}
            className="mt-6 bg-red-600 text-white px-8 py-4 text-xl rounded-2xl transition md:hover:bg-red-700"
          >
            Schicht beenden
          </button>
        </motion.div>
      ) : nextShift ? (
        // 🟡 Nächste Schicht
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-4">
            Nächste Schicht
          </h2>
          <p className="text-3xl text-gray-800 dark:text-gray-200 font-semibold">
            {format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")}
          </p>
        </motion.div>
      ) : (
        // ⚪ Keine Schicht
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-red-700 dark:text-red-400">
            Du hast aktuell keine Schicht
          </h2>
        </motion.div>
      )}
    </div>
  );
}
