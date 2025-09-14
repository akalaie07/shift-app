// App.jsx

import React, { useState, useEffect } from "react";
import { startOfMonth } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { supabase } from "./supabaseClient";
import useAuth from "./hooks/useAuth";

import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import Stats from "./components/Stats";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import ShiftPage from "./pages/ShiftPage";

export default function App() {
  const user = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthStart, setMonthStart] = useState(startOfMonth(new Date()));

  const location = useLocation();

  const fetchShifts = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", userId)
      .order("start", { ascending: true });

    if (!error) setShifts(data);
    else console.error("Fehler beim Laden der Schichten:", error.message);

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchShifts(user.id);
    else setShifts([]);
  }, [user]);

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

  const handleDelete = async (id) => {
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (!error) setShifts(shifts.filter((s) => s.id !== id));
  };

  if (!user) return <AuthPage />;
  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Lade Schichten…
      </div>
    );

  return (
    <div className="min-h-screen bg-red-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-500">
      <Navbar />

      <div className="max-w-full sm:max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 mt-4 overflow-hidden transition-colors duration-500">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4 }}
                >
                  <Home shifts={shifts} onUpdate={handleUpdate} />
                  <Stats shifts={shifts} />
                </motion.div>
              }
            />
            <Route
              path="/kalender"
              element={
                <motion.div
                  key="kalender"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4 }}
                >
                  <CalendarPage
                    shifts={shifts}
                    currentMonthStart={currentMonthStart}
                    setMonthStart={setMonthStart}
                  />
                </motion.div>
              }
            />
            <Route
              path="/schichten"
              element={
                <motion.div
                  key="schichten"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4 }}
                >
                  <ShiftPage
                    shifts={shifts}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </motion.div>
              }
            />
            {/* Fallback → Redirect zu Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}
