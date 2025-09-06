import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  differenceInMinutes,
  isBefore,
} from "date-fns";
import logo from "./assets/freddy-logo.png";

const STORAGE_KEY = "shifts_v1";

// ------------------- Helper -------------------
function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

function loadShifts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

function minutesToHHMM(totalMinutes) {
  if (totalMinutes == null || isNaN(totalMinutes)) return "00:00";
  const sign = totalMinutes < 0 ? "-" : "";
  const mins = Math.abs(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function nowLocalInput() {
  return new Date().toISOString().slice(0, 16);
}

function getWeekHours(shifts, weekStart, weekEnd) {
  const weekShifts = shifts.filter(
    (s) =>
      s.end &&
      parseISO(s.actualStart) >= weekStart &&
      parseISO(s.actualStart) <= weekEnd
  );
  const totalMinutes = weekShifts.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );
  return totalMinutes / 60;
}

// ------------------- Komponenten -------------------
function NewShiftForm({ onCreate }) {
  const [plannedStart, setPlannedStart] = useState(nowLocalInput());

  const handleSubmit = (e) => {
    e.preventDefault();
    const shift = {
      id: generateId(),
      plannedStart: new Date(plannedStart).toISOString(),
      actualStart: null,
      end: null,
      pauseMinutes: 0,
      durationMinutes: null,
      status: "planned",
    };
    onCreate(shift);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-md"
    >
      <label className="mb-1 font-semibold text-red-700">Geplante Startzeit</label>
      <input
        type="datetime-local"
        value={plannedStart}
        onChange={(e) => setPlannedStart(e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
      />
      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full sm:w-auto">
        Schicht eintragen
      </button>
    </form>
  );
}

function Calendar({ shifts, currentWeekStart, setWeekStart }) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const shiftsForDay = (day) =>
    shifts.filter((s) => s.actualStart && isSameDay(parseISO(s.actualStart), day));

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <button
          onClick={() => setWeekStart(subWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          &lt; Vorherige Woche
        </button>
        <span className="font-semibold text-red-700">
          {format(currentWeekStart, "dd.MM.yyyy")} - {format(weekEnd, "dd.MM.yyyy")}
        </span>
        <button
          onClick={() => setWeekStart(addWeeks(currentWeekStart, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Nächste Woche &gt;
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 py-2">
        {days.map((day) => (
          <div
            key={day}
            className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm"
          >
            <div className="font-semibold text-red-700">{format(day, "EEE")}</div>
            <div className="mb-1">{format(day, "d")}</div>

            {shiftsForDay(day).map((shift) => (
              <div
                key={shift.id}
                className="text-sm bg-red-100 text-red-800 rounded px-1 py-0.5 mb-1"
              >
                {shift.actualStart ? format(parseISO(shift.actualStart), "HH:mm") : "--:--"} -{" "}
                {shift.end ? format(parseISO(shift.end), "HH:mm") : "--:--"}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ hoursWorked, weeklyGoal }) {
  const progress = Math.min((hoursWorked / weeklyGoal) * 100, 100);

  return (
    <div className="my-4">
      <div className="flex justify-between mb-1 text-sm font-medium text-red-700">
        <span>Gearbeitete Stunden: {hoursWorked.toFixed(1)}h</span>
        <span>Wochenziel: {weeklyGoal}h</span>
      </div>
      <div className="w-full bg-red-100 rounded-full h-4">
        <div
          className="bg-red-600 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function ShiftList({ shifts, onEndShift }) {
  if (shifts.length === 0) return <p className="text-center text-gray-500 mb-4">Keine Schichten vorhanden</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shifts.map((shift) => (
        <div key={shift.id} className="p-3 bg-white rounded-lg shadow-sm border flex flex-col">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-red-700">Start:</span>
            <span>{shift.plannedStart ? format(parseISO(shift.plannedStart), "dd.MM HH:mm") : "--:--"}</span>
          </div>
          {shift.actualStart && (
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-red-700">Tatsächlicher Start:</span>
              <span>{format(parseISO(shift.actualStart), "HH:mm")}</span>
            </div>
          )}
          {shift.end && (
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-red-700">Ende:</span>
              <span>{format(parseISO(shift.end), "HH:mm")}</span>
            </div>
          )}
          {shift.durationMinutes !== null && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-red-700">Dauer:</span>
              <span>{minutesToHHMM(shift.durationMinutes)}</span>
            </div>
          )}
          {shift.status === "running" && (
            <button
              onClick={() => onEndShift(shift.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition self-end"
            >
              Schicht beenden
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ------------------- APP -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    setShifts(loadShifts());
  }, []);

  // Timer: prüft jede Sekunde geplante Shifts
  useEffect(() => {
    const interval = setInterval(() => {
      setShifts((prevShifts) => {
        const now = new Date();
        let updated = false;
        const newShifts = prevShifts.map((s) => {
          if (s.status === "planned" && isBefore(parseISO(s.plannedStart), now)) {
            updated = true;
            return { ...s, status: "running", actualStart: now.toISOString() };
          }
          return s;
        });
        if (updated) saveShifts(newShifts);
        return newShifts;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreate = (shift) => {
    const updated = [...shifts, shift];
    setShifts(updated);
    saveShifts(updated);
  };

  const handleEndShift = (id) => {
    const shift = shifts.find((s) => s.id === id);
    if (!shift) return;

    const endInput = prompt(
      "Endzeit der Schicht (HH:MM) oder leer für jetzt:",
      format(new Date(), "HH:mm")
    ) || format(new Date(), "HH:mm");

    const endTime = new Date(shift.actualStart);
    const [endH, endM] = endInput.split(":").map(Number);
    endTime.setHours(endH);
    endTime.setMinutes(endM);

    const pauseMinutes = Number(prompt("Hattest du Pause? Falls ja, wie viele Minuten?", "0") || "0");
    const durationMinutes = Math.max(differenceInMinutes(endTime, parseISO(shift.actualStart)) - pauseMinutes, 0);

    const updated = shifts.map((s) =>
      s.id === id
        ? { ...s, end: endTime.toISOString(), pauseMinutes, durationMinutes, status: "finished" }
        : s
    );

    setShifts(updated);
    saveShifts(updated);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-red-50 text-gray-800">
      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6">

        <div className="flex justify-center mb-4">
          <img src={logo} alt="Freddy Fresh Logo" className="h-20 sm:h-24" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-700">
          Freddy Fresh Schichtplaner
        </h1>

        <NewShiftForm onCreate={handleCreate} />

        <Calendar
          shifts={shifts}
          currentWeekStart={currentWeekStart}
          setWeekStart={setCurrentWeekStart}
        />

        <ProgressBar
          hoursWorked={getWeekHours(shifts, currentWeekStart, endOfWeek(currentWeekStart, { weekStartsOn: 1 }))}
          weeklyGoal={40}
        />

        <ShiftList shifts={shifts} onEndShift={handleEndShift} />
      </div>
    </div>
  );
}
