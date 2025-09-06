import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  differenceInMinutes,
} from "date-fns";

// **Logo importieren**
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

// Gearbeitete Stunden im aktuellen Monat
function getMonthHours(shifts, currentMonth) {
  const monthShifts = shifts.filter(
    (s) => s.end && isSameMonth(parseISO(s.start), currentMonth)
  );
  const totalMinutes = monthShifts.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );
  return totalMinutes / 60;
}

// ------------------- Komponenten -------------------
function NewShiftForm({ onCreate }) {
  const [start, setStart] = useState(nowLocalInput());
  const [end, setEnd] = useState("");
  const [pause, setPause] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const startISO = new Date(start).toISOString();
    const endISO = end ? new Date(end).toISOString() : null;

    const shift = {
      id: generateId(),
      start: startISO,
      end: endISO,
      pauseMinutes: Number(pause) || 0,
      durationMinutes: endISO
        ? Math.max(
            differenceInMinutes(new Date(endISO), new Date(startISO)) -
              (Number(pause) || 0),
            0
          )
        : null,
    };

    onCreate(shift);
    setStart(nowLocalInput());
    setEnd("");
    setPause(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mb-6 p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Startzeit</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Endzeit</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Pause (Minuten)</label>
        <input
          type="number"
          value={pause}
          onChange={(e) => setPause(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
        Schicht speichern
      </button>
    </form>
  );
}

function ShiftList({ shifts, onDelete }) {
  return (
    <table className="w-full text-left border-collapse mb-6">
      <thead>
        <tr className="bg-red-100 text-red-700">
          <th className="px-3 py-2">Start</th>
          <th className="px-3 py-2">Ende</th>
          <th className="px-3 py-2">Pause</th>
          <th className="px-3 py-2">Dauer</th>
          <th className="px-3 py-2">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {shifts.map((shift) => (
          <tr key={shift.id} className="border-b hover:bg-red-50">
            <td className="px-3 py-2">{format(parseISO(shift.start), "HH:mm")}</td>
            <td className="px-3 py-2">
              {shift.end ? format(parseISO(shift.end), "HH:mm") : "--:--"}
            </td>
            <td className="px-3 py-2">{shift.pauseMinutes}</td>
            <td className="px-3 py-2">{minutesToHHMM(shift.durationMinutes)}</td>
            <td className="px-3 py-2 flex gap-2">
              <button
                onClick={() => onDelete(shift.id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
              >
                Löschen
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Calendar({ shifts, currentMonth, setMonth }) {
  const month = currentMonth;
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const hasShift = (day) =>
    shifts.some((s) => isSameDay(parseISO(s.start), day));

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          &lt; Vorheriger
        </button>
        <span className="font-semibold text-red-700">{format(month, "MMMM yyyy")}</span>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Nächster &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className={`p-2 border rounded text-center cursor-pointer ${
              hasShift(day) ? "bg-red-200 text-red-800 font-semibold" : "bg-white"
            } hover:bg-red-100 transition`}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ hoursWorked, monthlyGoal }) {
  const progress = Math.min((hoursWorked / monthlyGoal) * 100, 100);

  return (
    <div className="my-4">
      <div className="flex justify-between mb-1 text-sm font-medium text-red-700">
        <span>Gearbeitete Stunden: {hoursWorked.toFixed(1)}h</span>
        <span>Monatsziel: {monthlyGoal}h</span>
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

// ------------------- APP -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setShifts(loadShifts());
  }, []);

  const handleCreate = (shift) => {
    const updated = [...shifts, shift];
    setShifts(updated);
    saveShifts(updated);
  };

  const handleDelete = (id) => {
    const updated = shifts.filter((s) => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
  };

  return (
    <div className="min-h-screen p-6 bg-red-50 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">

        {/* Logo oben */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Freddy Fresh Logo" className="h-50" />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-red-700">
          Freddy Fresh Schichtplaner
        </h1>

        {/* Formular */}
        <NewShiftForm onCreate={handleCreate} />

        {/* Kalender */}
        <Calendar
          shifts={shifts}
          currentMonth={currentMonth}
          setMonth={setCurrentMonth}
        />

        {/* Fortschrittsbalken */}
        <ProgressBar
          hoursWorked={getMonthHours(shifts, currentMonth)}
          monthlyGoal={40}
        />

        {/* Shift-Liste */}
        <ShiftList shifts={shifts} onDelete={handleDelete} />
      </div>
    </div>
  );
}