import React, { useState } from "react";
import { X, Menu } from "lucide-react"; // Icons für Hamburger & Close

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      {/* Logo / Titel */}
      <h1 className="text-lg sm:text-xl font-bold">Freddy Fresh</h1>

      {/* Desktop-Menü */}
      <div className="hidden md:flex gap-6">
        <a href="#" className="hover:text-gray-200 transition">
          Home
        </a>
        <a href="#kalender" className="hover:text-gray-200 transition">
          Kalender
        </a>
        <a href="#schichten" className="hover:text-gray-200 transition">
          Schichten
        </a>
      </div>

      {/* Hamburger-Button (nur mobil sichtbar) */}
      <button
        className="md:hidden p-2 focus:outline-none"
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={28} color="white" />
      </button>

      {/* Overlay-Menü */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMenuOpen(false)}
          >
            <X size={32} color="white" />
          </button>

          <div className="flex flex-col gap-6 text-2xl font-semibold">
            <a href="#" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="#kalender" onClick={() => setMenuOpen(false)}>
              Kalender
            </a>
            <a href="#schichten" onClick={() => setMenuOpen(false)}>
              Schichten
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
