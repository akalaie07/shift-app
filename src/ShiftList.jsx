import React, { useState } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, format, parseISO, isSameDay, differenceInMinutes } from "date-fns";

export default function ShiftPage({ shifts, onUpdate, onDelete, currentWeekStart, setWeekStart }) {
  const [newShiftTime, setNewShiftTime] = useState("");

  const handleCreate = () => {
    if(!newShiftTime) return;
    const shift = {
      id: `${Date.now()}-${Math.floor(Math.random()*10000)}`,
      start: new Date(newShiftTime).toISOString(),
      running: false,
    };
    onUpdate([...shifts, shift]);
    setNewShiftTime("");
  };

  const weekEnd = endOfWeek(currentWeekStart,{weekStartsOn:1});
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  const shiftsForDay = (day) => shifts.filter(s => isSameDay(parseISO(s.start), day));

  const now = new Date();

  const handleStart = (shift) => {
    const updated = shifts.map(s => s.id===shift.id ? {...s, actualStart: new Date().toISOString(), running:true} : s);
    onUpdate(updated);
  };

  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;

    if(!window.confirm(`Endzeit jetzt übernehmen? (${format(new Date(endTime),"HH:mm")})`)){
      const manual = prompt("Bitte Endzeit eingeben (YYYY-MM-DD HH:MM):", format(new Date(),"yyyy-MM-dd HH:mm"));
      if(manual) endTime = new Date(manual.replace(" ","T")).toISOString();
    }

    if(window.confirm("Hattest du Pause?")){
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if(pauseInput) pauseMinutes = parseInt(pauseInput);
    }

    const updated = shifts.map(s=>{
      if(s.id===shift.id){
        const durationMinutes = Math.max(differenceInMinutes(new Date(endTime), parseISO(s.actualStart || s.start)) - pauseMinutes,0);
        return {...s,end:endTime,pauseMinutes,durationMinutes,running:false};
      }
      return s;
    });
    onUpdate(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">Schichten verwalten</h2>

      {/* Neue Schicht */}
      <div className="flex gap-2 mb-4 justify-center">
        <input type="datetime-local" value={newShiftTime} onChange={e=>setNewShiftTime(e.target.value)} className="border rounded px-2 py-1"/>
        <button onClick={handleCreate} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">Hinzufügen</button>
      </div>

      {/* Wochenauswahl */}
      <div className="flex justify-between mb-2 flex-wrap gap-2">
        <button onClick={()=>setWeekStart(subWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">&lt; Vorherige Woche</button>
        <span className="font-semibold text-red-700">{format(currentWeekStart,"dd.MM.yyyy")} - {format(weekEnd,"dd.MM.yyyy")}</span>
        <button onClick={()=>setWeekStart(addWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Nächste Woche &gt;</button>
      </div>

      {/* Woche */}
      <div className="flex overflow-x-auto gap-2 py-2">
        {days.map(day=>(
          <div key={day} className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm">
            <div className="font-semibold text-red-700">{format(day,"EEE")}</div>
            <div className="mb-1">{format(day,"d")}</div>

            {shiftsForDay(day).map(shift=>{
              const isRunning = shift.running;
              const startTime = shift.actualStart || shift.start;
              let liveDuration = "";
              if(isRunning && startTime){
                const minutes = differenceInMinutes(now, parseISO(startTime));
                liveDuration = `${Math.floor(minutes/60)}h ${minutes%60}min`;
              }

              return (
                <div key={shift.id} className="mb-1 border rounded p-1 bg-red-100 text-red-800">
                  <div>{format(parseISO(shift.start),"HH:mm")}</div>
                  {shift.end && <div>{format(parseISO(shift.end),"HH:mm")}</div>}
                  {isRunning && <div>Live: {liveDuration}</div>}
                  {shift.durationMinutes && <div>Dauer: {Math.floor(shift.durationMinutes/60)}h {shift.durationMinutes%60}min</div>}
                  {!isRunning && !shift.end && <button onClick={()=>handleStart(shift)} className="bg-green-600 text-white px-2 py-0.5 rounded mt-1">Start</button>}
                  {isRunning && <button onClick={()=>handleEnd(shift)} className="bg-red-600 text-white px-2 py-0.5 rounded mt-1">Beenden</button>}
                  {!isRunning && shift.end && <button onClick={()=>onDelete(shift.id)} className="bg-gray-600 text-white px-2 py-0.5 rounded mt-1">Löschen</button>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
