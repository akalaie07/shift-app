import React, { useState, useEffect } from "react";
import { parseISO, format, differenceInMinutes } from "date-fns";

function ShiftList({ shifts, onUpdate, onDelete }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // Timer für Live-Anzeige
    return () => clearInterval(timer);
  }, []);

  const handleStart = (shift) => {
    const updated = shifts.map(s => {
      if (s.id === shift.id) {
        return { ...s, actualStart: new Date().toISOString(), running: true };
      }
      return s;
    });
    onUpdate(updated);
  };

  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;

    const confirmEnd = window.confirm(
      `Endzeit jetzt übernehmen? (${format(new Date(endTime), "HH:mm")})`
    );
    if (!confirmEnd) {
      const manual = prompt("Bitte Endzeit eingeben (YYYY-MM-DD HH:MM):", format(new Date(), "yyyy-MM-dd HH:mm"));
      if (manual) {
        endTime = new Date(manual.replace(" ", "T")).toISOString();
      }
    }

    const hadPause = window.confirm("Hattest du Pause?");
    if (hadPause) {
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if (pauseInput) pauseMinutes = parseInt(pauseInput);
    }

    const updated = shifts.map(s => {
      if (s.id === shift.id) {
        const durationMinutes = Math.max(
          differenceInMinutes(new Date(endTime), parseISO(s.actualStart)) - pauseMinutes,
          0
        );
        return {
          ...s,
          end: endTime,
          pauseMinutes,
          durationMinutes,
          running: false
        };
      }
      return s;
    });

    onUpdate(updated);
  };

  return (
    <div id="schichten" className="grid gap-3 sm:grid-cols-2">
      {shifts.map((shift) => {
        const isRunning = shift.running;
        const startTime = shift.actualStart || shift.start;

        let liveDuration = "";
        if (isRunning && startTime) {
          const minutes = differenceInMinutes(now, parseISO(startTime));
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          liveDuration = `${h}h ${m}min`;
        }

        return (
          <div key={shift.id} className="p-3 bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-red-700">Start:</span>
              <span>{format(parseISO(shift.start), "dd.MM HH:mm")}</span>
            </div>
            {shift.end && (
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-red-700">Ende:</span>
                <span>{format(parseISO(shift.end), "dd.MM HH:mm")}</span>
              </div>
            )}
            {isRunning && (
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-red-700">Live-Dauer:</span>
                <span>{liveDuration}</span>
              </div>
            )}
            {shift.pauseMinutes > 0 && (
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-red-700">Pause:</span>
                <span>{shift.pauseMinutes} Min</span>
              </div>
            )}
            {shift.durationMinutes && (
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-red-700">Dauer:</span>
                <span>{`${Math.floor(shift.durationMinutes / 60)}h ${shift.durationMinutes % 60}min`}</span>
              </div>
            )}

            {!isRunning && !shift.end && (
              <button
                onClick={() => handleStart(shift)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition self-end"
              >
                Schicht starten
              </button>
            )}

            {isRunning && (
              <button
                onClick={() => handleEnd(shift)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition self-end"
              >
                Schicht beenden
              </button>
            )}

            {!isRunning && shift.end && (
              <button
                onClick={() => onDelete(shift.id)}
                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition self-end"
              >
                Löschen
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ShiftList;
