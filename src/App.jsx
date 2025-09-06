import React, { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isSameDay, format, differenceInMinutes } from "date-fns";
import Navbar from "./Navbar";
import ShiftList from "./ShiftList";

const STORAGE_KEY = "shifts_v1";

// Speicherfunktionen
function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}
function loadShifts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

// ------------------- Home -------------------
function Home({ shifts, onUpdate }) {
  const now = new Date();
  const futureShifts = shifts
    .filter(s => s.start && new Date(s.start) > now || s.running)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextShift = futureShifts[0];

  const getTimeUntil = (startDate) => {
    const diffMs = new Date(startDate) - now;
    const diffMin = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (diffMin < 60) return `${diffMin} Min`;
    else if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)} Std ${diffMin % 60} Min`;
    else return `${Math.floor(diffMin / (60 * 24))} Tag ${diffMin % (24 * 60)} Min`;
  };

  const handleStart = (shift) => {
    const updated = shifts.map(s => s.id === shift.id ? { ...s, actualStart: new Date().toISOString(), running: true } : s);
    onUpdate(updated);
  };

  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;

    if (!window.confirm(`Endzeit jetzt übernehmen? (${format(new Date(endTime), "HH:mm")})`)) {
      const manual = prompt("Bitte Endzeit eingeben (YYYY-MM-DD HH:MM):", format(new Date(), "yyyy-MM-dd HH:mm"));
      if (manual) endTime = new Date(manual.replace(" ", "T")).toISOString();
    }

    if (window.confirm("Hattest du Pause?")) {
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if (pauseInput) pauseMinutes = parseInt(pauseInput);
    }

    const updated = shifts.map(s => {
      if (s.id === shift.id) {
        const durationMinutes = Math.max(differenceInMinutes(new Date(endTime), parseISO(s.actualStart)) - pauseMinutes, 0);
        return { ...s, end: endTime, pauseMinutes, durationMinutes, running: false };
      }
      return s;
    });

    onUpdate(updated);
  };

  return (
    <div id="home" className="mb-6 flex justify-center">
      {nextShift ? (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center transition-transform hover:scale-105">
          <h2 className="text-3xl font-bold text-red-700 mb-4">Nächste Schicht</h2>
          <p className="text-gray-800 text-2xl font-semibold">{format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")}</p>
          {!nextShift.running && new Date(nextShift.start) <= now && (
            <button
              onClick={() => handleStart(nextShift)}
              className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition"
            >
              Schicht starten
            </button>
          )}
          {nextShift.running && (
            <button
              onClick={() => handleEnd(nextShift)}
              className="bg-red-600 text-white px-4 py-2 rounded mt-4 hover:bg-red-700 transition"
            >
              Schicht beenden
            </button>
          )}
          {!nextShift.running && new Date(nextShift.start) > now && (
            <p className="mt-3 text-gray-600 font-medium text-xl">Beginnt in: {getTimeUntil(nextShift.start)}</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </div>
      )}
    </div>
  );
}

// ------------------- Kalender -------------------
function Calendar({ shifts, currentMonthStart, setMonthStart }) {
  const monthEnd = endOfMonth(currentMonthStart);
  const days = Array.from({ length: monthEnd.getDate() }, (_, i) => new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth(), i + 1));
  const shiftsForDay = (day) => shifts.filter(s => isSameDay(parseISO(s.start), day));

  return (
    <div id="kalender" className="mb-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <button onClick={() => setMonthStart(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">← Vorheriger Monat</button>
        <span className="text-xl font-semibold text-red-700">{format(currentMonthStart, "MMMM yyyy")}</span>
        <button onClick={() => setMonthStart(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Nächster Monat →</button>
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

// ------------------- App -------------------
// App.jsx
// ... (Rest bleibt gleich oben)

export default function App() {
  const [shifts, setShifts] = useState([]);
  const [activePage, setActivePage] = useState("home");
  const [currentMonthStart, setMonthStart] = useState(new Date());

  useEffect(() => setShifts(loadShifts()), []);

  // 🔄 automatischer Start-Checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let changed = false;
      const updated = shifts.map(s => {
        if (!s.running && new Date(s.start) <= now && !s.end) {
          changed = true;
          return { ...s, actualStart: new Date().toISOString(), running: true };
        }
        return s;
      });
      if (changed) {
        setShifts(updated);
        saveShifts(updated);
      }
    }, 60000); // jede Minute prüfen
    return () => clearInterval(interval);
  }, [shifts]);

  const handleCreate = (shift) => { const updated = [...shifts, shift]; setShifts(updated); saveShifts(updated); };
  const handleDelete = (id) => { const updated = shifts.filter(s => s.id !== id); setShifts(updated); saveShifts(updated); };
  const handleUpdate = (updatedShifts) => { setShifts(updatedShifts); saveShifts(updatedShifts); };

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        {activePage === "home" && <Home shifts={shifts} onUpdate={handleUpdate} />}
        {activePage === "kalender" && <Calendar shifts={shifts} currentMonthStart={currentMonthStart} setMonthStart={setMonthStart} />}
        {activePage === "schichten" && (
          <ShiftList
            shifts={shifts}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

