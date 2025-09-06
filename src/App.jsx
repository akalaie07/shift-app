import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInMinutes, isBefore } from "date-fns";
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

function nowLocalInput() {
  return new Date().toISOString().slice(0, 16);
}

function minutesToHHMM(totalMinutes) {
  if (totalMinutes == null || isNaN(totalMinutes)) return "00:00";
  const sign = totalMinutes < 0 ? "-" : "";
  const mins = Math.abs(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-red-700">Geplante Startzeit</label>
        <input
          type="datetime-local"
          value={plannedStart}
          onChange={(e) => setPlannedStart(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
        />
      </div>
      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full sm:w-auto">
        Schicht eintragen
      </button>
    </form>
  );
}

function ShiftList({ shifts, onEndShift }) {
  if (shifts.length === 0)
    return <p className="text-center text-gray-500 mb-4">Keine Schichten vorhanden</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shifts.map((shift) => (
        <div key={shift.id} className="p-3 bg-white rounded-lg shadow-sm border flex flex-col">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-red-700">Start:</span>
            <span>{format(parseISO(shift.plannedStart), "dd.MM HH:mm")}</span>
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

  // Lädt gespeicherte Schichten
  useEffect(() => {
    setShifts(loadShifts());
  }, []);

  // ------------------- Automatischer Timer -------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setShifts((prevShifts) => {
        let updated = false;
        const newShifts = prevShifts.map((s) => {
          if (s.status === "planned" && isBefore(parseISO(s.plannedStart), new Date())) {
            updated = true;
            return { ...s, status: "running", actualStart: new Date().toISOString() };
          }
          return s;
        });
        if (updated) saveShifts(newShifts);
        return newShifts;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ------------------- Handler -------------------
  const handleCreate = (shift) => {
    const updated = [...shifts, shift];
    setShifts(updated);
    saveShifts(updated);
  };

  const handleEndShift = (id) => {
    const shift = shifts.find((s) => s.id === id);
    if (!shift) return;

    // Endzeit abfragen
    let endInput = prompt("Endzeit der Schicht (HH:MM) oder leer für jetzt:", format(new Date(), "HH:mm")) || format(new Date(), "HH:mm");
    const endTime = new Date(shift.actualStart);
    const [endH, endM] = endInput.split(":").map(Number);
    endTime.setHours(endH);
    endTime.setMinutes(endM);

    // Pause abfragen
    let pauseMinutes = prompt("Hattest du Pause? Falls ja, wie viele Minuten?", "0") || "0";

    const durationMinutes = Math.max(differenceInMinutes(endTime, parseISO(shift.actualStart)) - Number(pauseMinutes), 0);

    const updated = shifts.map((s) =>
      s.id === id
        ? {
            ...s,
            end: endTime.toISOString(),
            pauseMinutes: Number(pauseMinutes),
            durationMinutes,
            status: "finished",
          }
        : s
    );
    setShifts(updated);
    saveShifts(updated);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-red-50 text-gray-800">
      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Freddy Fresh Logo" className="h-20 sm:h-24" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-700">
          Freddy Fresh Schichtplaner
        </h1>

        {/* Formular */}
        <NewShiftForm onCreate={handleCreate} />

        {/* Shift-Liste */}
        <ShiftList shifts={shifts} onEndShift={handleEndShift} />
      </div>
    </div>
  );
}
