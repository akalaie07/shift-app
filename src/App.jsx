// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { startOfMonth, parseISO, differenceInMinutes, format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from './supabaseClient';
import AuthPage from './Auth';
import Navbar from "./Navbar";
import ShiftList from "./ShiftList";
import Stats from "./Stats";
import Calendar from "./Calendar";

// ------------------- Storage -------------------
const STORAGE_KEY = "shifts_v1";
const saveShifts = (shifts) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts, null, 2));
const loadShifts = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ------------------- Home -------------------
function Home({ shifts, onUpdate }) {
  const [now, setNow] = useState(new Date());

  // Uhrzeit jede Sekunde aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-Start für Schichten
  useEffect(() => {
    const updatedShifts = shifts.map((s) => {
      if (!s.running && !s.end && s.start && new Date(s.start) <= now) {
        return { ...s, running: true, actualStart: new Date().toISOString() };
      }
      return s;
    });
    if (JSON.stringify(updatedShifts) !== JSON.stringify(shifts)) {
      onUpdate(updatedShifts);
    }
  }, [now, shifts, onUpdate]);

  const runningShift = useMemo(() => shifts.find((s) => s.running && !s.end), [shifts]);
  const futureShifts = useMemo(
    () =>
      shifts
        .filter((s) => !s.running && !s.end && s.start && new Date(s.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [shifts, now]
  );
  const nextShift = futureShifts[0];

  let liveDuration = "",
    progressPercent = 0;
  if (runningShift?.actualStart) {
    const startTime = new Date(runningShift.actualStart);
    const minutesPassed = Math.floor((now - startTime) / 60000);
    const maxDuration = 180;
    liveDuration = `${Math.floor(minutesPassed / 60)}h ${minutesPassed % 60}min`;
    progressPercent = Math.min((minutesPassed / maxDuration) * 100, 100);
  }

  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;

    if (!window.confirm(`Endzeit jetzt übernehmen? (${format(new Date(endTime), "HH:mm")})`)) {
      const manual = prompt(
        "Endzeit eingeben (YYYY-MM-DD HH:MM):",
        format(new Date(), "yyyy-MM-dd HH:mm")
      );
      if (manual) endTime = new Date(manual.replace(" ", "T")).toISOString();
    }

    if (window.confirm("Hattest du Pause?")) {
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if (pauseInput) pauseMinutes = parseInt(pauseInput);
    }

    const updated = shifts.map((s) => {
      if (s.id === shift.id) {
        const durationMinutes = Math.max(
          differenceInMinutes(new Date(endTime), new Date(s.actualStart || s.start)) - pauseMinutes,
          0
        );
        return { ...s, end: endTime, pauseMinutes, durationMinutes, running: false };
      }
      return s;
    });

    onUpdate(updated);
  };

  return (
    <div className="mb-6 flex justify-center">
      {runningShift ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-12 rounded-2xl shadow-2xl relative flex flex-col items-center"
        >
          <div className="relative w-72 h-72 mb-8">
            <svg className="w-72 h-72" viewBox="0 0 36 36">
              <path
                className="text-gray-300"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                strokeWidth="3"
                stroke="#22c55e"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100 - progressPercent}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                transition={{ ease: "linear", duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-semibold text-gray-800">
              <h2 className="text-3xl font-bold text-red-700 mb-2">Schicht läuft</h2>
              <p className="text-2xl">Gestartet: {format(new Date(runningShift.actualStart), "HH:mm")}</p>
              <p className="text-2xl mt-2">Dauer: {liveDuration}</p>
            </div>
          </div>
          <button
            onClick={() => handleEnd(runningShift)}
            className="mt-6 bg-red-600 text-white px-8 py-4 text-xl rounded-2xl hover:bg-red-700 transition"
          >
            Schicht beenden
          </button>
        </motion.div>
      ) : nextShift ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-red-700 mb-4">Nächste Schicht</h2>
          <p className="text-3xl text-gray-800 font-semibold">
            {format(parseISO(nextShift.start), "dd.MM.yyyy HH:mm")}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </motion.div>
      )}
    </div>
  );
}

// ------------------- APP -------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [currentMonthStart, setMonthStart] = useState(startOfMonth(new Date()));

  // Auth & Daten laden
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user;
      setUser(currentUser);
      if (currentUser) fetchShifts(currentUser.id);
    });

    // Live-Auth-Updates
    supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) fetchShifts(newUser.id);
      else setShifts([]);
    });
  }, []);

  // Schichten laden
  const fetchShifts = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", userId)
      .order("start", { ascending: true });

    if (error) {
      console.error("Fehler beim Laden der Schichten:", error.message);
    } else {
      setShifts(data);
    }

    setLoading(false);
  };

  // Schichten speichern
  const handleUpdate = async (updatedShifts) => {
    setShifts(updatedShifts);

    const toUpsert = updatedShifts.map((s) => ({
      ...s,
      user_id: user.id,
    }));

    const { error } = await supabase.from("shifts").upsert(toUpsert, {
      onConflict: "id",
    });

    if (error) console.error("Fehler beim Speichern:", error.message);
  };

  // Schicht löschen
  const handleDelete = async (id) => {
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (!error) setShifts(shifts.filter((s) => s.id !== id));
  };

  if (!user) return <AuthPage />;
  if (loading) return <div className="p-6 text-center text-gray-600">Lade Schichten…</div>;

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} shifts={shifts} logoCentered />
      <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {activePage === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Home shifts={shifts} onUpdate={handleUpdate} />
              <Stats shifts={shifts} />
            </motion.div>
          )}
          {activePage === "kalender" && (
            <motion.div
              key="kalender"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Calendar shifts={shifts} currentMonthStart={currentMonthStart} setMonthStart={setMonthStart} />
            </motion.div>
          )}
          {activePage === "schichten" && (
            <motion.div
              key="schichten"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShiftList shifts={shifts} onUpdate={handleUpdate} onDelete={handleDelete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
