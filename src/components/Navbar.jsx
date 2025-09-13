// src/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Icons
import logo from "/freddy-logo.png"; // passe den Pfad ggf. an

export default function Navbar({ activePage, setActivePage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const NavLink = ({ page, label }) => (
    <button
      onClick={() => {
        setActivePage(page);
        setMenuOpen(false); // Menü schließen nach Klick
      }}
      className={`px-2 py-1 rounded ${
        activePage === page
          ? "bg-red-900 text-white"
          : "hover:bg-red-800 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-red-700 text-white px-4 py-2 shadow relative">
      <div className="flex items-center justify-between">
        {/* Desktop-Links */}
        {!isMobile && (
          <div className="flex gap-4">
            <NavLink page="home" label="Home" />
            <NavLink page="schichten" label="Schichten" />
            <NavLink page="kalender" label="Kalender" />
          </div>
        )}

        {/* Logo immer zentriert */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src={logo} alt="Logo" className="h-10 object-contain" />
        </div>

        {/* Hamburger-Icon für Mobile */}
        {isMobile && (
          <button onClick={toggleMenu} className="ml-auto">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </div>

      {/* Mobile-Menü */}
      {isMobile && menuOpen && (
        <div className="flex flex-col gap-2 mt-2 bg-red-600 rounded-lg p-3">
          <NavLink page="home" label="Home" />
          <NavLink page="schichten" label="Schichten" />
          <NavLink page="kalender" label="Kalender" />
        </div>
      )}
    </nav>
  );
}
