// src/components/Navbar.jsx
import React, { useState } from "react";
import { Sun, Moon, Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function Navbar({ activePage, setActivePage }) {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white px-4 py-3 flex justify-between items-center relative shadow-md">
      {/* Left Section: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo mit Quadrat im Light Mode */}
        <div
          className={`flex items-center justify-center h-10 w-10 rounded-lg transition 
                      ${darkMode ? "" : "bg-red-600 shadow-lg"}`}
        >
          <img
            src={darkMode ? "/freddy-logo-dark.png" : "/freddy-logo-light.png"}
            alt="Logo"
            className={`h-8 transition ${darkMode ? "scale-110" : ""}`}
          />
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex space-x-4">
        {["home", "schichten", "kalender"].map((page) => (
          <button
            key={page}
            onClick={() => handleNavClick(page)}
            className={`px-3 py-2 rounded-md transition ${
              activePage === page
                ? "bg-red-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </div>

      {/* Right Section: Darkmode Toggle (immer sichtbar) + Logout nur Desktop */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle (mobil + desktop) */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Logout nur auf Desktop */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
        >
          <LogOut size={18} /> Abmelden
        </button>
      </div>

      {/* Sidebar (Mobile, von links) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-72 h-full bg-gray-100 dark:bg-gray-950 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-lg transition 
                              ${darkMode ? "" : "bg-red-600 shadow-lg"}`}
                >
                  <img
                    src={darkMode ? "/freddy-logo-dark.png" : "/freddy-logo-light.png"}
                    alt="Logo"
                    className={`h-8 transition ${darkMode ? "scale-110" : ""}`}
                  />
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Nav Items */}
              <div className="flex-1 flex flex-col gap-2 p-6">
                {["home", "schichten", "kalender"].map((page) => (
                  <button
                    key={page}
                    onClick={() => handleNavClick(page)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all
                      ${
                        activePage === page
                          ? "bg-red-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    {page === "home" && "🏠"}
                    {page === "schichten" && "🕒"}
                    {page === "kalender" && "📅"}
                    {page.charAt(0).toUpperCase() + page.slice(1)}
                  </button>
                ))}
              </div>

              {/* Footer mit Theme Switch + Logout */}
              <div className="p-6 border-t border-gray-300 dark:border-gray-700 flex flex-col gap-3">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                            bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                            bg-red-600 text-white hover:bg-red-700 transition"
                >
                  <LogOut size={18} /> Abmelden
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
