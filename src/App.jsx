import React, { useState, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  isSameDay,
  format,
  differenceInMinutes
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// ------------------- Storage -------------------
const STORAGE_KEY = "shifts_v1";
function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}
function loadShifts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

// ------------------- Navbar -------------------
function Navbar({ activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClick = (page) => { setActivePage(page); setMenuOpen(false); };

  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-lg sm:text-xl font-bold">Freddy Fresh</h1>

      <div className="hidden md:flex gap-6">
        {["home","kalender","schichten"].map((p)=>(
          <button key={p} onClick={()=>handleClick(p)}
            className={`transition ${activePage===p?"underline":"hover:text-gray-200"}`}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      <button className="md:hidden p-2 focus:outline-none" onClick={()=>setMenuOpen(true)}>
        <Menu size={28} color="white"/>
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <button className="absolute top-4 right-4 text-white" onClick={()=>setMenuOpen(false)}>
            <X size={32} color="white"/>
          </button>
          <div className="flex flex-col gap-8 text-3xl font-bold text-center">
            {["home","kalender","schichten"].map((p)=>(
              <button key={p} onClick={()=>handleClick(p)} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition">
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// ------------------- Home -------------------
function Home({ shifts, onUpdate }) {
  const [now,setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); },[]);

  useEffect(()=>{
    const next=shifts.find(s=>!s.running&&!s.end && new Date(s.start)<=now);
    if(next){
      const updated=shifts.map(s=>s.id===next.id?{...s,running:true,actualStart:new Date().toISOString()}:s);
      onUpdate(updated);
    }
  },[now,shifts,onUpdate]);

  const runningShift=shifts.find(s=>s.running);
  const futureShifts=shifts.filter(s=>!s.running && s.start && new Date(s.start)>now).sort((a,b)=>new Date(a.start)-new Date(b.start));
  const nextShift=futureShifts[0];

  let liveDuration="";
  let progressPercent=0;
  if(runningShift?.actualStart){
    const diffMs = now-new Date(runningShift.actualStart);
    const minutes=Math.floor(diffMs/60000);
    liveDuration=`${Math.floor(minutes/60)}h ${minutes%60}min`;
    progressPercent = Math.min((minutes/180)*100,100);
  }

  const handleEnd = (shift) => {
    let endTime = new Date().toISOString();
    let pauseMinutes = 0;
    if(!window.confirm(`Endzeit jetzt übernehmen? (${format(new Date(endTime),"HH:mm")})`)){
      const manual = prompt("Bitte Endzeit eingeben (YYYY-MM-DD HH:MM):", format(new Date(),"yyyy-MM-dd HH:mm"));
      if(manual) endTime = new Date(manual.replace(" ","T")).toISOString();
    }
    if(window.confirm("Hattest du Pause?")){
      const pauseInput = prompt("Wie viele Minuten Pause?");
      if(pauseInput) pauseMinutes=parseInt(pauseInput);
    }
    const updated = shifts.map(s=>{
      if(s.id===shift.id){
        const durationMinutes=Math.max(differenceInMinutes(new Date(endTime), parseISO(s.actualStart||s.start))-pauseMinutes,0);
        return {...s,end:endTime,pauseMinutes,durationMinutes,running:false};
      }
      return s;
    });
    onUpdate(updated);
  };

  return (
    <div className="mb-6 flex justify-center">
      {runningShift ? (
        <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="bg-white p-10 rounded-xl shadow-xl relative flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            <svg className="w-64 h-64" viewBox="0 0 36 36">
              <path className="text-gray-300" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <motion.path strokeWidth="3" stroke="#22c55e" fill="none" strokeDasharray="100" strokeDashoffset={100-progressPercent} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-semibold text-gray-800">
              <h2 className="text-3xl font-bold text-red-700 mb-2">Schicht läuft</h2>
              <p className="text-xl">Gestartet: {format(new Date(runningShift.actualStart),"HH:mm")}</p>
              <p className="text-xl mt-2">Dauer: {liveDuration}</p>
            </div>
          </div>
          <button onClick={()=>handleEnd(runningShift)} className="mt-4 bg-red-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-red-700 transition">Schicht beenden</button>
        </motion.div>
      ) : nextShift ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-10 rounded-xl shadow-xl flex flex-col items-center">
          <h2 className="text-3xl font-bold text-red-700 mb-4">Nächste Schicht</h2>
          <p className="text-2xl text-gray-800 font-semibold">{format(parseISO(nextShift.start),"dd.MM.yyyy HH:mm")}</p>
        </motion.div>
      ) : (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white p-10 rounded-xl shadow-xl flex flex-col items-center">
          <h2 className="text-3xl font-bold text-red-700">Du hast aktuell keine Schicht</h2>
        </motion.div>
      )}
    </div>
  );
}


// ------------------- Kalender -------------------
function Calendar({ shifts, currentMonthStart, setMonthStart }) {
  const monthEnd = endOfMonth(currentMonthStart);
  const days = eachDayOfInterval({start:currentMonthStart,end:monthEnd});
  const shiftsForDay = (day)=>shifts.filter(s=>isSameDay(parseISO(s.start),day));

  return (
    <div className="mb-6 overflow-hidden relative">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <button onClick={()=>setMonthStart(subMonths(currentMonthStart,1))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">← Vorheriger Monat</button>
        <span className="text-xl font-semibold text-red-700">{format(currentMonthStart,"MMMM yyyy")}</span>
        <button onClick={()=>setMonthStart(addMonths(currentMonthStart,1))} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Nächster Monat →</button>
      </div>
      <motion.div key={currentMonthStart} initial={{x:100,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-100,opacity:0}} className="grid grid-cols-7 gap-2">
        {days.map(day=>{
          const dayShifts = shiftsForDay(day);
          return (
            <div key={day} className="p-2 rounded-lg text-center border bg-white">
              <div className="font-semibold text-red-700">{format(day,"d")}</div>
              {dayShifts.map(shift=>{
                let bg="bg-yellow-200 text-yellow-800";
                if(shift.running) bg="bg-green-200 text-green-800";
                if(shift.end) bg="bg-gray-200 text-gray-600";
                return (
                  <div key={shift.id} className={`text-sm rounded px-1 py-0.5 mt-1 ${bg}`}>
                    {format(parseISO(shift.start),"HH:mm")}{shift.end && <> - {format(parseISO(shift.end),"HH:mm")}</>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ------------------- Schichten (Wochenansicht) -------------------
function ShiftList({ shifts, onUpdate, onDelete }) {
  const [newShiftTime,setNewShiftTime]=useState("");
  const [weekStart,setWeekStart]=useState(startOfWeek(new Date(),{weekStartsOn:1}));

  const handleCreate=()=>{
    if(!newShiftTime) return;
    const shift={id:`${Date.now()}-${Math.floor(Math.random()*10000)}`,start:new Date(newShiftTime).toISOString(),running:false};
    onUpdate([...shifts,shift]);
    setNewShiftTime("");
  };

  const weekEnd=endOfWeek(weekStart,{weekStartsOn:1});
  const days=eachDayOfInterval({start:weekStart,end:weekEnd});
  const shiftsForDay=(day)=>shifts.filter(s=>isSameDay(parseISO(s.start),day));

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">Schichten verwalten</h2>
      <div className="flex gap-2 mb-4 justify-center">
        <input type="datetime-local" value={newShiftTime} onChange={e=>setNewShiftTime(e.target.value)} className="border rounded px-3 py-2"/>
        <button onClick={handleCreate} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Hinzufügen</button>
      </div>
      <div className="flex gap-2 overflow-x-auto py-2">
        {days.map(day=>(
          <div key={day} className="flex-shrink-0 w-36 p-3 border rounded text-center bg-white shadow-md">
            <div className="font-semibold text-red-700 mb-2">{format(day,"EEE d")}</div>
            <AnimatePresence>
              {shiftsForDay(day).map(shift=>(
                <motion.div key={shift.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="mb-2 border rounded-lg p-2 bg-red-100 text-red-800 relative">
                  {format(parseISO(shift.start),"HH:mm")}
                  <div className="absolute top-0 right-0 flex flex-col">
                    <button onClick={()=>{const newTime=prompt("Neue Startzeit (YYYY-MM-DD HH:MM):"); if(newTime){shift.start=new Date(newTime.replace(" ","T")).toISOString(); onUpdate([...shifts])}}} className="text-xs px-1">✎</button>
                    <button onClick={()=>onDelete(shift.id)} className="text-xs px-1">🗑</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------- APP -------------------
export default function App(){
  const [shifts,setShifts]=useState([]);
  const [activePage,setActivePage]=useState("home");
  const [currentMonthStart,setMonthStart]=useState(startOfMonth(new Date()));

  useEffect(()=>setShifts(loadShifts()),[]);

  const handleUpdate=(updatedShifts)=>{ setShifts(updatedShifts); saveShifts(updatedShifts);}
  const handleDelete=(id)=>{ handleUpdate(shifts.filter(s=>s.id!==id));}

  return (
    <div className="min-h-screen bg-red-50 text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage}/>
      <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 overflow-hidden">
        <AnimatePresence exitBeforeEnter>
          {activePage==="home" && <Home key="home" shifts={shifts} onUpdate={handleUpdate}/>}
          {activePage==="kalender" && <Calendar key="kalender" shifts={shifts} currentMonthStart={currentMonthStart} setMonthStart={setMonthStart}/>}
          {activePage==="schichten" && <ShiftList key="schichten" shifts={shifts} onUpdate={handleUpdate} onDelete={handleDelete}/>}
        </AnimatePresence>
      </div>
    </div>
  );
}
