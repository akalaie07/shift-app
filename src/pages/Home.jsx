// src/components/ShiftList.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  differenceInMinutes,
} from "date-fns";
import useIsMobile from "../hooks/useIsMobile";
import { Plus, Clock, Coffee, Trash2, Edit2 } from "lucide-react";

export default function ShiftList({ shifts, onUpdate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ start: "", end: "", pause: 0 });
  const [currentWeekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [mode, setMode] = useState("auto"); // "auto" | "past" | "current"
  const [askChoice, setAskChoice] = useState(false);

  const isMobile = useIsMobile();
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const shiftsForWeek = shifts.filter((s) => {
    if (!s.start) return false;
    const start = parseISO(s.start);
    return start >= currentWeekStart && start <= weekEnd;
  });

  const saveShift = () => {
    const start = new Date(modalData.start);
    const diffMins = differenceInMinutes(new Date(), start);

    if (mode === "auto") {
      if (diffMins > 0 && diffMins <= 120) {
        setAskChoice(true);
        return;
      }
      if (diffMins <= 0) setMode("current");
      if (diffMins > 120) setMode("past");
    }

    if (mode === "current") {
      const startTime = modalData.start ? new Date(modalData.start) : new Date();
      const shift = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        start: startTime.toISOString(),
        end: null,
        pauseMinutes: 0,
        durationMinutes: null,
        running: true,
        actualStart: startTime.toISOString(), // ✅ direkt mitgeben
      };
      onUpdate([...shifts, shift]);
      setModalOpen(false);
      setMode("auto");
      return;
    }

    if (mode === "past") {
      const end = new Date(modalData.end);
      const pauseMinutes = parseInt(modalData.pause) || 0;

      if (end <= start) {
        alert("Ende muss nach Start liegen.");
        return;
      }

      const durationMinutes = Math.max(
        differenceInMinutes(end, start) - pauseMinutes,
        0
      );

      const shift = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        start: start.toISOString(),
        end: end.toISOString(),
        pauseMinutes,
        durationMinutes,
        running: false,
      };
      onUpdate([...shifts, shift]);
      setModalOpen(false);
      setMode("auto");
      return;
    }
  };

  const handleEdit = (shift) => {
    const newTime = prompt(
      "Neue Startzeit eingeben (YYYY-MM-DD HH:MM):",
      format(parseISO(shift.start), "yyyy-MM-dd HH:mm")
    );
    if (newTime) {
      const updated = shifts.map((s) =>
        s.id === shift.id
          ? { ...s, start: new Date(newTime.replace(" ", "T")).toISOString() }
          : s
      );
      onUpdate(updated);
    }
  };

  return (
    <div id="schichten" className="relative">
      {/* ... dein restlicher Code bleibt gleich ... */}
    </div>
  );
}
