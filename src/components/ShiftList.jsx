// src/ShiftList.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
} from "date-fns";
import useIsMobile from "../hooks/useIsMobile";

export default function ShiftList({ shifts, onUpdate, onDelete }) {
  const [newShiftTime, setNewShiftTime] = useState("");
  const [currentWeekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [menuOpen, setMenuOpen] = useState(null);
  const isMobile = useIsMobile();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    start: "",
    end: "",
    pause: 0,
  });

  const openOldShiftModal = (defaultDate) => {
    setModalData({
      start: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
      end: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
      pause: 0,
    });
    setModalOpen(true);
  };

  const saveOldShift = () => {
    const start = new Date(modalData.start);
    const end = new Date(modalData.end);
    const pauseMinutes = parseInt(modalData.pause) || 0;
    const durationMinutes = Math.max(
      Math.floor((end - start) / 60000) - pauseMinutes,
      0
    );

    const oldShift = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      start: start.toISOString(),
      end: end.toISOString(),
      pauseMinutes,
      durationMinutes,
      running: false,
    };
    onUpdate([...shifts, oldShift]);
    setModalOpen(false);
    setNewShiftTime("");
  };

  const handleCreate = () => {
    if (!newShiftTime) return;
    const shiftDate = new Date(newShiftTime);
    const now = new Date();

    if (shiftDate < now) {
      openOldShiftModal(shiftDate);
      return;
    }

    const shift = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      start: shiftDate.toISOString(),
      running: false,
    };
    onUpdate([...shifts, shift]);
    setNewShiftTime("");
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
    setMenuOpen(null);
  };

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  const shiftsForDay = (day) =>
    shifts.filter((s) => isSameDay(parseISO(s.start), day));

  return (
    <div id="schichten">
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4 text-center">
        Schichten verwalten
      </h2>

      {/* Neue Schicht */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        <input
          type="datetime-local"
          value={newShiftTime}
          onChange={(e) => setNewShiftTime(e.target.value)}
          className="border rounded px-2 py-1 
                     bg-gray-50 dark:bg-gray-800 
                     text-gray-800 dark:text-white 
                     border-gray-300 dark:border-gray-700"
        />
        <button
          onClick={handleCreate}
          className="px-4 py-1 rounded transition 
                     bg-red-600 text-white 
                     md:hover:bg-red-700 dark:bg-red-500 dark:md:hover:bg-red-600"
        >
          Hinzufügen
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mb-2 flex-wrap gap-2">
        <button
          onClick={() => setWeekStart(subWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded 
                     md:hover:bg-red-700 dark:bg-red-500 dark:md:hover:bg-red-600"
        >
          {isMobile ? "←" : "< Vorherige Woche"}
        </button>
        {!isMobile && (
          <span className="font-semibold text-red-700 dark:text-red-400">
            {format(currentWeekStart, "dd.MM.yyyy")} -{" "}
            {format(weekEnd, "dd.MM.yyyy")}
          </span>
        )}
        <button
          onClick={() => setWeekStart(addWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded 
                     md:hover:bg-red-700 dark:bg-red-500 dark:md:hover:bg-red-600"
        >
          {isMobile ? "→" : "Nächste Woche >"}
        </button>
      </div>

      {/* Tage in Grid */}
      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-7"} gap-3 py-4`}>
        {days.map((day) => (
          <div
            key={day}
            className="p-3 border rounded-lg text-center 
                       bg-white dark:bg-gray-900 shadow-sm relative 
                       border-gray-200 dark:border-gray-700
                       md:hover:border-white transition"
          >
            <div className="font-semibold text-red-700 dark:text-red-400">
              {format(day, "EEE")}
            </div>
            <div className="mb-1 text-gray-700 dark:text-gray-300">
              {format(day, "d")}
            </div>
            {shiftsForDay(day).map((shift) => (
              <div
                key={shift.id}
                className="mb-1 border rounded p-1 
                           bg-red-100 dark:bg-red-900 
                           text-red-800 dark:text-red-300 relative"
              >
                <div>{format(parseISO(shift.start), "HH:mm")}</div>
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === shift.id ? null : shift.id)
                  }
                  className="absolute top-1 right-1 text-gray-700 dark:text-gray-300"
                >
                  ⋮
                </button>
                {menuOpen === shift.id && (
                  <div className="absolute top-6 right-1 bg-white dark:bg-gray-800 border rounded shadow-md z-10">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="block w-full text-left px-3 py-1 md:hover:bg-gray-100 md:dark:hover:bg-gray-700"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => {
                        onDelete(shift.id);
                        setMenuOpen(null);
                      }}
                      className="block w-full text-left px-3 py-1 md:hover:bg-gray-100 md:dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                    >
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

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
                Alte Schicht eintragen
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Startzeit</label>
                <input
                  type="datetime-local"
                  value={modalData.start}
                  onChange={(e) =>
                    setModalData({ ...modalData, start: e.target.value })
                  }
                  className="border rounded px-2 py-1 
                             bg-gray-50 dark:bg-gray-800 
                             text-gray-800 dark:text-white 
                             border-gray-300 dark:border-gray-700"
                />

                <label className="text-sm font-semibold">Endzeit</label>
                <input
                  type="datetime-local"
                  value={modalData.end}
                  onChange={(e) =>
                    setModalData({ ...modalData, end: e.target.value })
                  }
                  className="border rounded px-2 py-1 
                             bg-gray-50 dark:bg-gray-800 
                             text-gray-800 dark:text-white 
                             border-gray-300 dark:border-gray-700"
                />

                <label className="text-sm font-semibold">Pause (Minuten)</label>
                <input
                  type="number"
                  min="0"
                  value={modalData.pause}
                  onChange={(e) =>
                    setModalData({ ...modalData, pause: e.target.value })
                  }
                  className="border rounded px-2 py-1 
                             bg-gray-50 dark:bg-gray-800 
                             text-gray-800 dark:text-white 
                             border-gray-300 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 
                             md:hover:bg-gray-300 dark:md:hover:bg-gray-600"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveOldShift}
                  className="px-4 py-2 rounded bg-red-600 text-white 
                             md:hover:bg-red-700 dark:bg-red-500 dark:md:hover:bg-red-600"
                >
                  Speichern
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
