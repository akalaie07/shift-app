// src/Navbar.jsx
import React from "react";
import logo from "./assets/freddy-logo.png";

export default function Navbar({ activePage, setActivePage, shifts }) {
  return (
    <nav className="bg-white shadow px-4 py-3 relative flex items-center justify-between">
      {/* Links */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActivePage("home")}
          className={`font-semibold ${activePage === "home" ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
        >
          Home
        </button>
        <button
          onClick={() => setActivePage("kalender")}
          className={`font-semibold ${activePage === "kalender" ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
        >
          Kalender
        </button>
        <button
          onClick={() => setActivePage("schichten")}
          className={`font-semibold ${activePage === "schichten" ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
        >
          Schichten
        </button>
      </div>

      {/* Logo absolut zentriert */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img
          src={logo}
          alt="Logo"
          className="h-10 cursor-pointer"
          onClick={() => setActivePage("home")} // klickbar zurück zu Home
        />
      </div>

      {/* Rechts (optional) */}
      <div className="flex items-center gap-4">
        {/* Platz für später, z.B. User-Icon */}
      </div>
    </nav>
  );
}
