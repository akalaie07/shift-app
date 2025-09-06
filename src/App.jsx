import React, { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay, format, differenceInMinutes } from "date-fns";
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
function Home({ shifts, onUpdate }) {
  const now = new Date();
  const futureShifts = shifts
    .filter(s => s.start && new Date(s.start) > now || (s.running && !s.end))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextShift = futureShifts[0];

  const [liveNow, setLiveNow] = useState(new Date());

  // Timer für Live-Dauer
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatisches Starten der Schicht
  useEffect(() => {
    if (!nextShift) return;
    if (!nextShift.running && !nextShift.end && new Date(nextShift.start) <= liveNow) {
      const updated = shifts.map(s =>
        s.id === nextShift.id ? { ...s, running: true, actualStart: new Date().toISOString() } : s
      );
      onUpdate(updated);
    }
  }, [liveNow, nextShift]);

  const handleStart = (shift) => {
    const updated = shifts.map(s =>
      s.id === shift.id ? { ...s, running: true, actualStart: new Date().toISOString() } : s
    );
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
        const durationMinutes = Math.max(differenceInMinutes(new Date(endTime), parseISO(s.actualStart || s.start)) - pauseMinutes, 0);
        return { ...s, end: endTime, pauseMinutes, durationMinutes, running: false };
      }
      return s;
    });
    onUpdate(updated);
  };

  const getTimeUntil = (startDate) => {
    const diffMs = new Date(startDate) - liveNow;
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
          {!nextShift.running && !nextShift.end && (
            <p className="mt-3 text-gray-600 font-medium text-xl">Beginnt in: {getTimeUntil(nextShift.start)}</p>
          )}

          {/* Start / End Button */}
          {(!nextShift.end) && (
            <div className="mt-4">
              {!nextShift.running ? (
                <button onClick={() => handleStart(nextShift)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Schicht starten</button>
              ) : (
                <>
                  <div className="text-gray-700 mt-2 mb-2">
                    Live-Dauer: {(() => {
                      const minutes = differenceInMinutes(liveNow, parseISO(nextShift.actualStart));
                      return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
                    })()}
                  </div>
                  <button onClick={() => handleEnd(nextShift)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Schicht beenden</button>
                </>
              )}
            </div>
          )}

          {nextShift.pauseMinutes > 0 && (
            <div className="mt-2 text-gray-700">Pause: {nextShift.pauseMinutes} Min</div>
          )}

          {nextShift.durationMinutes && (
            <div className="mt-2 text-gray-700">Dauer: {Math.floor(nextShift.durationMinutes/60)}h {nextShift.durationMinutes%60}min</div>
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


// ------------------- Kalender (Monat) -------------------
function Calendar({ shifts, currentMonthStart, setMonthStart }) {
  const monthEnd = endOfMonth(currentMonthStart);
  const days = eachDayOfInterval({ start: currentMonthStart, end: monthEnd });

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

// ------------------- APP -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [activePage, setActivePage] = useState("home");
  const [currentMonthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => setShifts(loadShifts()), []);

  // ----- Automatisches Starten der Schichten -----
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const updated = shifts.map(s => {
        if (!s.running && !s.end && new Date(s.start) <= now) {
          return { ...s, running: true, actualStart: now.toISOString() };
        }
        return s;
      });
      setShifts(updated);
      saveShifts(updated);
    }, 1000); // prüft jede Sekunde
    return () => clearInterval(timer);
  }, [shifts]);

  const handleUpdate = (updatedShifts) => {
    setShifts(updatedShifts);
    saveShifts(updatedShifts);
  };

  const handleDelete = (id) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
  };

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        {activePage === "home" && <Home shifts={shifts} />}
        {activePage === "kalender" && <Calendar shifts={shifts} currentMonthStart={currentMonthStart} setMonthStart={setMonthStart} />}
        {activePage === "schichten" && <ShiftList shifts={shifts} onUpdate={handleUpdate} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
