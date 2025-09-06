import React, { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, parseISO, isSameDay, format, differenceInMinutes } from "date-fns";
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
    <div id="home" className="mb-6 flex justify-center">
      {nextShift ? (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center transition-transform hover:scale-105">
          <h2 className="text-3xl font-bold text-red-700 mb-4">Nächste Schicht</h2>
          <p className="text-gray-800 text-2xl font-semibold">{format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")}</p>
          <p className="mt-3 text-gray-600 font-medium text-xl">Beginnt in: {getTimeUntil(nextShift.start)}</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </div>
      )}
    </div>
  );
}

// ------------------- Kalender (Monat) -------------------
function Calendar({ shifts, currentMonthStart, setMonthStart }) {
  const monthStart = startOfMonth(currentMonthStart);
  const monthEnd = endOfMonth(currentMonthStart);

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const shiftsForDay = (day) => shifts.filter(s => isSameDay(parseISO(s.start), day));

  return (
    <div id="kalender" className="mb-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <button onClick={() => setMonthStart(new Date(monthStart.setMonth(monthStart.getMonth() - 1)))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">← Vorheriger Monat</button>
        <span className="text-xl font-semibold text-red-700">{format(currentMonthStart, "MMMM yyyy")}</span>
        <button onClick={() => setMonthStart(new Date(monthStart.setMonth(monthStart.getMonth() + 1)))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Nächster Monat →</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayShifts = shiftsForDay(day);
          return (
            <div key={day} className={`p-2 rounded-lg text-center border ${dayShifts.length ? "bg-red-100 border-red-400" : "bg-white"}`}>
              <div className="font-semibold text-red-700">{format(day, "d")}</div>
              {dayShifts.map(shift => (
                <div key={shift.id} className="text-sm bg-red-200 text-red-800 rounded px-1 py-0.5 mt-1">
                  {format(parseISO(shift.start), "HH:mm")}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ------------------- APP -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [activePage, setActivePage] = useState("home");
  const [currentMonthStart, setMonthStart] = useState(startOfMonth(new Date()));
  const [currentWeekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

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

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        {activePage === "home" && <Home shifts={shifts} />}
        {activePage === "kalender" && <Calendar shifts={shifts} currentMonthStart={currentMonthStart} setMonthStart={setMonthStart} />}
        {activePage === "schichten" && (
          <ShiftList
            shifts={shifts}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            currentWeekStart={currentWeekStart}
            setWeekStart={setWeekStart}
          />
        )}
      </div>
    </div>
  );
}
