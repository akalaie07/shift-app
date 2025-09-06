import React, { useState } from "react";
import { X, Menu } from "lucide-react";

export default function Navbar({ activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-lg sm:text-xl font-bold">Freddy Fresh</h1>

      <div className="hidden md:flex gap-6">
        <button onClick={()=>handleClick("home")} className={`transition ${activePage==="home"?"underline":"hover:text-gray-200"}`}>Home</button>
        <button onClick={()=>handleClick("kalender")} className={`transition ${activePage==="kalender"?"underline":"hover:text-gray-200"}`}>Kalender</button>
        <button onClick={()=>handleClick("schichten")} className={`transition ${activePage==="schichten"?"underline":"hover:text-gray-200"}`}>Schichten</button>
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
            <button onClick={()=>handleClick("home")} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition">Home</button>
            <button onClick={()=>handleClick("kalender")} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition">Kalender</button>
            <button onClick={()=>handleClick("schichten")} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition">Schichten</button>
          </div>
        </div>
      )}
    </nav>
  );
}
