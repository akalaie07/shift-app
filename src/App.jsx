import React, { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";
import Navbar from "./Navbar";
import ShiftList from "./ShiftList";

const STORAGE_KEY = "shifts_v1";

function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

function loadShifts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

// ------------------- Home -------------------
function Home({ shifts }) {
  const now = new Date();
  const futureShifts = shifts
    .filter(s => s.start && new Date(s.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextShift = futureShifts[0];

  const getTimeUntil = (startDate) => {
    const diffMs = new Date(startDate) - now;
    const diffMin = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    if (diffMin < 60) return `${diffMin} Min`;
    else if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)} Std ${diffMin % 60} Min`;
    else return `${Math.floor(diffMin / (60 * 24))} Tag ${diffMin % (24 * 60)} Min`;
  };

  return (
    <div id="home" className="mb-6 text-center">
      {nextShift ? (
        <div className="bg-white p-6 rounded-lg shadow-md inline-block">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Nächste Schicht</h2>
          <p className="text-gray-800 text-xl font-semibold">{format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")}</p>
          <p className="mt-2 text-gray-600 font-medium">Beginnt in: {getTimeUntil(nextShift.start)}</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md inline-block">
          <h2 className="text-2xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </div>
      )}
    </div>
  );
}

// ------------------- App -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => setShifts(loadShifts()), []);

  const handleCreate = (shift) => {
    const updated = [...shifts, shift];
    setShifts(updated);
    saveShifts(updated);
  };

  const handleDelete = (id) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
  };

  const handleUpdate = (updatedShifts) => {
    setShifts(updatedShifts);
    saveShifts(updatedShifts);
  };

  // Temporärer Kalender (wochenweise) – optional später ersetzen
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  const shiftsForDay = (day) => shifts.filter(s => isSameDay(parseISO(s.start), day));

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar />

      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        <Home shifts={shifts} />

        {/* Schichten-Seite */}
        <ShiftList shifts={shifts} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>
    </div>
  );
}
