// src/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Icons

export default function Navbar({ activePage, setActivePage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    // 🔎 Beobachte Dark/Light Wechsel
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
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

        {/* Logo in der Mitte */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src={theme === "dark" ? "/freddy-logo-dark.png" : "/freddy-logo-light.png"}
            alt="Logo"
            className="h-10 object-contain transition duration-300"
          />
        </div>

        {/* Mobile: Hamburger Menü */}
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
