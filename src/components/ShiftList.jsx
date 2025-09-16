// src/components/ShiftList.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  differenceInMinutes,
} from "date-fns";
import useIsMobile from "../hooks/useIsMobile";
import { Plus, Clock, Coffee, Trash2, Edit2 } from "lucide-react";

export default function ShiftList({ shifts, onUpdate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ start: "", end: "", pause: 0 });
  const [currentWeekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [mode, setMode] = useState("auto"); // "auto" | "past" | "current"
  const [askChoice, setAskChoice] = useState(false);

  const isMobile = useIsMobile();

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const shiftsForWeek = shifts.filter(
    (s) =>
      s.start &&
      new Date(s.start) >= currentWeekStart &&
      new Date(s.start) <= weekEnd
  );

  const saveShift = () => {
    const start = new Date(modalData.start);
    const diffMins = differenceInMinutes(new Date(), start);

    // Auto-Check → Entscheidung anzeigen
    if (mode === "auto") {
      if (diffMins >= 120) {
        setAskChoice(true);
        return;
      }
      setMode("current");
    }

    // Aktuelle Schicht → nur Startzeit speichern
    if (mode === "current") {
      const shift = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        start: start.toISOString(),
        end: null,
        pauseMinutes: 0,
        durationMinutes: null,
        running: true,
      };
      onUpdate([...shifts, shift]);
      setModalOpen(false);
      setMode("auto");
      return;
    }

    // Vergangene Schicht → Start, Ende, Pause
    if (mode === "past") {
      const end = new Date(modalData.end);
      const pauseMinutes = parseInt(modalData.pause) || 0;

      if (end <= start) {
        alert("Ende muss nach Start liegen.");
        return;
      }

      const durationMinutes = Math.max(
        differenceInMinutes(end, start) - pauseMinutes,
        0
      );

      const shift = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        start: start.toISOString(),
        end: end.toISOString(),
        pauseMinutes,
        durationMinutes,
        running: false,
      };
      onUpdate([...shifts, shift]);
      setModalOpen(false);
      setMode("auto");
      return;
    }
  };

  const handleEdit = (shift) => {
    const newTime = prompt(
      "Neue Startzeit eingeben (YYYY-MM-DD HH:MM):",
      format(parseISO(shift.start), "yyyy-MM-dd HH:mm")
    );
    if (newTime) {
      const updated = shifts.map((s) =>
        s.id === shift.id
          ? { ...s, start: new Date(newTime.replace(" ", "T")).toISOString() }
          : s
      );
      onUpdate(updated);
    }
  };

  return (
    <div id="schichten" className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
          Schichten verwalten
        </h2>

        {!isMobile && (
          <button
            onClick={() => {
              setModalOpen(true);
              setMode("auto");
              setModalData({ start: "", end: "", pause: 0 });
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
          >
            <Plus size={18} /> Neue Schicht
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setWeekStart(subWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          {isMobile ? "←" : "< Vorherige Woche"}
        </button>
        <span className="font-semibold text-red-700 dark:text-red-400">
          {format(currentWeekStart, "dd.MM.yyyy")} - {format(weekEnd, "dd.MM.yyyy")}
        </span>
        <button
          onClick={() => setWeekStart(addWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          {isMobile ? "→" : "Nächste Woche >"}
        </button>
      </div>

      {/* Tabelle */}
      {!isMobile && (
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-2">Datum</th>
              <th className="p-2">Start</th>
              <th className="p-2">Ende</th>
              <th className="p-2">Pause</th>
              <th className="p-2">Dauer</th>
              <th className="p-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {shiftsForWeek.map((shift) => (
              <tr key={shift.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{format(parseISO(shift.start), "dd.MM.yyyy")}</td>
                <td className="p-2">{format(parseISO(shift.start), "HH:mm")}</td>
                <td className="p-2">
                  {shift.end ? format(parseISO(shift.end), "HH:mm") : "-"}
                </td>
                <td className="p-2">{shift.pauseMinutes || 0} min</td>
                <td className="p-2">{shift.durationMinutes || "-"} min</td>
                <td className="p-2 text-right flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(shift.id)}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Floating Button Mobile */}
      {isMobile && (
        <button
          onClick={() => {
            setModalOpen(true);
            setMode("auto");
            setModalData({ start: "", end: "", pause: 0 });
          }}
          className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 md:hidden"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="modal"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-80 shadow-lg border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">
                {mode === "past" ? "Vergangene Schicht eintragen" : "Schicht eintragen"}
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Startzeit</label>
                <input
                  type="datetime-local"
                  value={modalData.start}
                  onChange={(e) => setModalData({ ...modalData, start: e.target.value })}
                  className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                />

                {mode === "past" && (
                  <>
                    <label className="text-sm font-semibold">Endzeit</label>
                    <input
                      type="datetime-local"
                      value={modalData.end}
                      onChange={(e) => setModalData({ ...modalData, end: e.target.value })}
                      className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />

                    <label className="text-sm font-semibold">Pause (Minuten)</label>
                    <input
                      type="number"
                      min="0"
                      value={modalData.pause}
                      onChange={(e) => setModalData({ ...modalData, pause: e.target.value })}
                      className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  </>
                )}
              </div>

              <div className={`flex gap-2 mt-4 ${isMobile ? "flex-col" : "justify-end"}`}>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setMode("auto");
                  }}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full md:w-auto"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveShift}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 w-full md:w-auto"
                >
                  Speichern
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entscheidungsdialog */}
      <AnimatePresence>
        {askChoice && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-80"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Welche Art von Schicht?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Deine Startzeit liegt mehr als 2 Stunden in der Vergangenheit.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMode("past");
                    setAskChoice(false);
                  }}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Vergangene Schicht
                </button>
                <button
                  onClick={() => {
                    setMode("current");
                    setAskChoice(false);
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Aktuelle Schicht
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
