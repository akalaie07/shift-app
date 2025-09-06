import React, { useState } from "react";
import { X, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-lg sm:text-xl font-bold">Freddy Fresh</h1>

      <div className="hidden md:flex gap-6">
        <Link to="/" className="hover:text-gray-200 transition">Home</Link>
        <Link to="/kalender" className="hover:text-gray-200 transition">Kalender</Link>
        <Link to="/schichten" className="hover:text-gray-200 transition">Schichten</Link>
      </div>

      <button className="md:hidden p-2 focus:outline-none" onClick={() => setMenuOpen(true)}>
        <Menu size={28} color="white" />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <button className="absolute top-4 right-4 text-white" onClick={() => setMenuOpen(false)}>
            <X size={32} color="white" />
          </button>

          <div className="flex flex-col gap-8 text-3xl font-bold text-center">
            <Link to="/" className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/kalender" className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition" onClick={() => setMenuOpen(false)}>Kalender</Link>
            <Link to="/schichten" className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 shadow-lg transition" onClick={() => setMenuOpen(false)}>Schichten</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
