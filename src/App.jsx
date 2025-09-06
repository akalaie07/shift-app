import React, { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, format, isSameDay, parseISO, differenceInMinutes } from "date-fns";
import Navbar from "./Navbar";

const STORAGE_KEY = "shifts_v1";

// ------------------- Storage -------------------
function saveShifts(shifts) { localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts)); }
function loadShifts() { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }

// ------------------- App -------------------
export default function App() {
  const [shifts, setShifts] = useState([]);
  const [currentWeekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentPage, setCurrentPage] = useState("home");
  const [newShiftTime, setNewShiftTime] = useState("");

  useEffect(() => setShifts(loadShifts()), []);

  const handleUpdate = (updatedShifts) => { setShifts(updatedShifts); saveShifts(updatedShifts); };
  const handleDelete = (id) => { const updated = shifts.filter(s => s.id!==id); setShifts(updated); saveShifts(updated); };

  // ------------------- Home -------------------
  const renderHome = () => {
    const now = new Date();
    const futureShifts = shifts.filter(s => s.start && new Date(s.start) > now).sort((a,b)=>new Date(a.start)-new Date(b.start));
    const nextShift = futureShifts[0];

    const getTimeUntil = (startDate) => {
      const diffMin = Math.max(0, Math.floor((new Date(startDate)-now)/(1000*60)));
      if(diffMin<60) return `${diffMin} Min`;
      else if(diffMin<24*60) return `${Math.floor(diffMin/60)} Std ${diffMin%60} Min`;
      else return `${Math.floor(diffMin/(24*60))} Tag ${diffMin%(24*60)} Min`;
    };

    return (
      <div id="home" className="mb-6 text-center">
        {nextShift ? (
          <div className="bg-white p-6 rounded-lg shadow-md inline-block">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Nächste Schicht</h2>
            <p className="text-gray-800 text-xl font-semibold">{format(parseISO(nextShift.start),"dd.MM.yyyy HH:mm")}</p>
            <p className="mt-2 text-gray-600 font-medium">Beginnt in: {getTimeUntil(nextShift.start)}</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md inline-block">
            <h2 className="text-2xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
          </div>
        )}
      </div>
    );
  };

  // ------------------- Kalender -------------------
  const renderCalendar = () => {
    const weekEnd = endOfWeek(currentWeekStart,{weekStartsOn:1});
    const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
    const shiftsForDay = (day) => shifts.filter(s=>isSameDay(parseISO(s.start),day));

    return (
      <div id="kalender">
        <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">Kalender</h2>
        <div className="flex justify-between mb-2 flex-wrap gap-2">
          <button onClick={()=>setWeekStart(subWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">&lt; Vorherige Woche</button>
          <span className="font-semibold text-red-700">{format(currentWeekStart,"dd.MM.yyyy")} - {format(weekEnd,"dd.MM.yyyy")}</span>
          <button onClick={()=>setWeekStart(addWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Nächste Woche &gt;</button>
        </div>

        <div className="flex overflow-x-auto gap-2 py-2">
          {days.map(day=>(
            <div key={day} className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm">
              <div className="font-semibold text-red-700">{format(day,"EEE")}</div>
              <div className="mb-1">{format(day,"d")}</div>
              {shiftsForDay(day).map(shift=>(
                <div key={shift.id} className="mb-1 border rounded p-1 bg-red-100 text-red-800">
                  <div>{format(parseISO(shift.start),"HH:mm")}</div>
                  {shift.end && <div>{format(parseISO(shift.end),"HH:mm")}</div>}
                  {shift.durationMinutes && <div>Dauer: {Math.floor(shift.durationMinutes/60)}h {shift.durationMinutes%60}min</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ------------------- Schichten -------------------
  const renderShifts = () => {
    const weekEnd = endOfWeek(currentWeekStart,{weekStartsOn:1});
    const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
    const now = new Date();

    const handleCreate = () => {
      if(!newShiftTime) return;
      const shift = { id:`${Date.now()}-${Math.floor(Math.random()*10000)}`, start:new Date(newShiftTime).toISOString(), running:false };
      handleUpdate([...shifts,shift]);
      setNewShiftTime("");
    };

    const handleStart = (shift) => { 
      const updated = shifts.map(s=>s.id===shift.id?{...s, actualStart:new Date().toISOString(), running:true}:s); 
      handleUpdate(updated); 
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
          const durationMinutes = Math.max(differenceInMinutes(new Date(endTime), parseISO(s.actualStart||s.start)) - pauseMinutes,0);
          return {...s,end:endTime,pauseMinutes,durationMinutes,running:false};
        }
        return s;
      });
      handleUpdate(updated);
    };

    const shiftsForDay = (day) => shifts.filter(s=>isSameDay(parseISO(s.start),day));

    return (
      <div>
        <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">Schichten verwalten</h2>
        <div className="flex gap-2 mb-4 justify-center">
          <input type="datetime-local" value={newShiftTime} onChange={e=>setNewShiftTime(e.target.value)} className="border rounded px-2 py-1"/>
          <button onClick={handleCreate} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">Hinzufügen</button>
        </div>

        <div className="flex justify-between mb-2 flex-wrap gap-2">
          <button onClick={()=>setWeekStart(subWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">&lt; Vorherige Woche</button>
          <span className="font-semibold text-red-700">{format(currentWeekStart,"dd.MM.yyyy")} - {format(weekEnd,"dd.MM.yyyy")}</span>
          <button onClick={()=>setWeekStart(addWeeks(currentWeekStart,1))} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Nächste Woche &gt;</button>
        </div>

        <div className="flex overflow-x-auto gap-2 py-2">
          {days.map(day=>(
            <div key={day} className="flex-shrink-0 w-28 p-2 border rounded text-center bg-white shadow-sm">
              <div className="font-semibold text-red-700">{format(day,"EEE")}</div>
              <div className="mb-1">{format(day,"d")}</div>

              {shiftsForDay(day).map(shift=>{
                const isRunning = shift.running;
                const startTime = shift.actualStart||shift.start;
                let liveDuration="";
                if(isRunning && startTime){
                  const minutes=differenceInMinutes(new Date(),parseISO(startTime));
                  liveDuration=`${Math.floor(minutes/60)}h ${minutes%60}min`;
                }
                return (
                  <div key={shift.id} className="mb-1 border rounded p-1 bg-red-100 text-red-800">
                    <div>{format(parseISO(shift.start),"HH:mm")}</div>
                    {shift.end && <div>{format(parseISO(shift.end),"HH:mm")}</div>}
                    {isRunning && <div>Live: {liveDuration}</div>}
                    {shift.durationMinutes && <div>Dauer: {Math.floor(shift.durationMinutes/60)}h {shift.durationMinutes%60}min</div>}
                    {!isRunning && !shift.end && <button onClick={()=>handleStart(shift)} className="bg-green-600 text-white px-2 py-0.5 rounded mt-1">Start</button>}
                    {isRunning && <button onClick={()=>handleEnd(shift)} className="bg-red-600 text-white px-2 py-0.5 rounded mt-1">Beenden</button>}
                    {!isRunning && shift.end && <button onClick={()=>handleDelete(shift.id)} className="bg-gray-600 text-white px-2 py-0.5 rounded mt-1">Löschen</button>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      <div className="max-w-full sm:max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4">
        {currentPage==="home" && renderHome()}
        {currentPage==="kalender" && renderCalendar()}
        {currentPage==="schichten" && renderShifts()}
      </div>
    </div>
  );
}
