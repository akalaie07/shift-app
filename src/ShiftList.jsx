// src/ShiftList.jsx
import React, { useState, useEffect } from "react";
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

export default function ShiftList({ shifts, onUpdate, onDelete }) {
  const [newShiftTime, setNewShiftTime] = useState("");
  const [currentWeekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [menuOpen, setMenuOpen] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update isMobile bei Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCreate = () => {
    if (!newShiftTime) return;
    const shift = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      start: new Date(newShiftTime).toISOString(),
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
  const shiftsForDay = (day) => shifts.filter((s) => isSameDay(parseISO(s.start), day));

  // Aufteilen in mobile zwei Reihen
  const firstRow = isMobile ? days.slice(0, 4) : days;
  const secondRow = isMobile ? days.slice(4, 7) : [];

  const renderDays = (dayArray) =>
    dayArray.map((day) => (
      <div
        key={day}
        className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm relative"
      >
        <div className="font-semibold text-red-700">{format(day, "EEE")}</div>
        <div className="mb-1">{format(day, "d")}</div>
        {shiftsForDay(day).map((shift) => (
          <div
            key={shift.id}
            className="mb-1 border rounded p-1 bg-red-100 text-red-800 relative"
          >
            <div>{format(parseISO(shift.start), "HH:mm")}</div>
            <button
              onClick={() => setMenuOpen(menuOpen === shift.id ? null : shift.id)}
              className="absolute top-1 right-1 text-gray-700"
            >
              ⋮
            </button>
            {menuOpen === shift.id && (
              <div className="absolute top-6 right-1 bg-white border rounded shadow-md z-10">
                <button
                  onClick={() => handleEdit(shift)}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => {
                    onDelete(shift.id);
                    setMenuOpen(null);
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-red-600"
                >
                  Löschen
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ));

  return (
    <div id="schichten">
      <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">
        Schichten verwalten
      </h2>

      {/* Neue Schicht */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        <input
          type="datetime-local"
          value={newShiftTime}
          onChange={(e) => setNewShiftTime(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleCreate}
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          Hinzufügen
        </button>
      </div>

      {/* Wochenauswahl */}
      <div className="flex justify-between mb-2 flex-wrap gap-2">
        <button
          onClick={() => setWeekStart(subWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          {isMobile ? "←" : "< Vorherige Woche"}
        </button>
        {!isMobile && (
          <span className="font-semibold text-red-700">
            {format(currentWeekStart, "dd.MM.yyyy")} - {format(weekEnd, "dd.MM.yyyy")}
          </span>
        )}
        <button
          onClick={() => setWeekStart(addWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          {isMobile ? "→" : "Nächste Woche >"}
        </button>
      </div>

      {/* Woche */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-center gap-2 flex-wrap">{renderDays(firstRow)}</div>
        {secondRow.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap">{renderDays(secondRow)}</div>
        )}
      </div>
    </div>
  );
}
