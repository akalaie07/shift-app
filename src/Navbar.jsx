import React, { useState } from "react";
import { X, Menu } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      {/* Logo / Titel */}
      <h1 className="text-lg sm:text-xl font-bold">Freddy Fresh</h1>

      {/* Desktop-Menü */}
      <div className="hidden md:flex gap-6">
        <a href="#" className="hover:text-gray-200 transition">Home</a>
        <a href="#kalender" className="hover:text-gray-200 transition">Kalender</a>
        <a href="#schichten" className="hover:text-gray-200 transition">Schichten</a>
      </div>

      {/* Hamburger-Button (mobil) */}
      <button
        className="md:hidden p-2 focus:outline-none"
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={28} color="white" />
      </button>

      {/* Overlay-Menü */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          {/* Close-Button */}
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMenuOpen(false)}
          >
            <X size={32} color="white" />
          </button>

          {/* Menü-Links */}
          <div className="flex flex-col gap-8 text-3xl font-bold text-center">
            <a
              href="#"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 transition shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#kalender"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 transition shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Kalender
            </a>
            <a
              href="#schichten"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-4 transition shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Schichten
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
