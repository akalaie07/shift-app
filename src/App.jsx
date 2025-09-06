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
} from "date-fns";

import logo from "./assets/freddy-logo.png";
import Navbar from "./Navbar";

const STORAGE_KEY = "shifts_v1";

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
    (s) => s.end && parseISO(s.start) >= weekStart && parseISO(s.start) <= weekEnd
  );
  const totalMinutes = weekShifts.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );
  return totalMinutes / 60;
}

// ------------------- Home -------------------
function Home({ shifts }) {
  const now = new Date();
  const futureShifts = shifts
    .filter(s => s.start && new Date(s.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextShift = futureShifts[0];

  return (
    <div id="home" className="mb-6 text-center">
      {nextShift ? (
        <div className="bg-white p-6 rounded-lg shadow-md inline-block">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Nächste Schicht</h2>
          <p className="text-gray-800">
            {format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")} -{" "}
            {nextShift.end ? format(parseISO(nextShift.end), "HH:mm") : "--:--"}
          </p>
          <p className="mt-2 text-gray-600">
            Beginnt in:{" "}
            {Math.max(
              0,
              Math.floor((new Date(nextShift.start) - now) / (1000 * 60))
            )}{" "}
            Minuten
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md inline-block">
          <h2 className="text-2xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </div>
      )}
    </div>
  );
}

// ------------------- NewShiftForm -------------------
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
            differenceInMinutes(new Date(endISO), new Date(startISO)) - Number(pause || 0),
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
      className="flex flex-col gap-4 mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Startzeit</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Endzeit</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Pause (Minuten)</label>
        <input
          type="number"
          value={pause}
          onChange={(e) => setPause(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
        />
      </div>

      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full sm:w-auto">
        Schicht speichern
      </button>
    </form>
  );
}

// ------------------- ShiftList -------------------
function ShiftList({ shifts, onDelete }) {
  if (!shifts.length) return <p className="text-center text-gray-500 mb-4">Keine Schichten vorhanden</p>;

  return (
    <div id="schichten" className="grid gap-3 sm:grid-cols-2">
      {shifts.map((shift) => (
        <div key={shift.id} className="p-3 bg-white rounded-lg shadow-sm border flex flex-col">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-red-700">Start:</span>
            <span>{shift.start ? format(parseISO(shift.start), "dd.MM HH:mm") : "--:--"}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-red-700">Ende:</span>
            <span>{shift.end ? format(parseISO(shift.end), "dd.MM HH:mm") : "--:--"}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-red-700">Pause:</span>
            <span>{shift.pauseMinutes} Min</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-red-700">Dauer:</span>
            <span>{minutesToHHMM(shift.durationMinutes)}</span>
          </div>
          <button
            onClick={() => onDelete(shift.id)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition self-end"
          >
            Löschen
          </button>
        </div>
      ))}
    </div>
  );
}

// ------------------- Calendar -------------------
function Calendar({ shifts, currentWeekStart, setWeekStart }) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const shiftsForDay = (day) => shifts.filter((s) => isSameDay(parseISO(s.start), day));

  return (
    <div id="kalender" className="mb-6">
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
          <div key={day} className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm">
            <div className="font-semibold text-red-700">{format(day, "EEE")}</div>
            <div className="mb-1">{format(day, "d")}</div>
            {shiftsForDay(day).map((shift) => (
              <div key={shift.id} className="text-sm bg-red-100 text-red-800 rounded px-1 py-0.5 mb-1">
                {shift.start ? format(parseISO(shift.start), "HH:mm") : "--:--"} -{" "}
                {shift.end ? format(parseISO(shift.end), "HH:mm") : "--:--"}
              </div>
            ))}
          </div>
        ))}
      </div>
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
    const updated = shifts.filter((s) => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
  };

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar />
      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        <Home shifts={shifts} />
        <Calendar shifts={shifts} currentWeekStart={currentWeekStart} setWeekStart={setCurrentWeekStart} />
        <NewShiftForm onCreate={handleCreate} />
        <ShiftList shifts={shifts} onDelete={handleDelete} />
      </div>
    </div>
  );
}
