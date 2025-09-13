import React, { useState, useEffect } from "react";
import { startOfMonth } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "./supabaseClient";
import useAuth from "./hooks/useAuth";

import AuthPage from "./Auth";
import Navbar from "./components/Navbar";
import Stats from "./components/Stats";
import Home from "./pages/Home"; // musst du auslagern aus bisherigem App.jsx
import CalendarPage from "./pages/CalendarPage";
import ShiftPage from "./pages/ShiftPage";

export default function App() {
  const user = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [currentMonthStart, setMonthStart] = useState(startOfMonth(new Date()));

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

  // Wenn User sich einloggt → Shifts holen
  useEffect(() => {
    if (user) fetchShifts(user.id);
    else setShifts([]);
  }, [user]);

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
      <Navbar activePage={activePage} setActivePage={setActivePage} shifts={shifts} />

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
              <CalendarPage
                shifts={shifts}
                currentMonthStart={currentMonthStart}
                setMonthStart={setMonthStart}
              />
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
              <ShiftPage
                shifts={shifts}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
