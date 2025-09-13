import { useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ThemeToggle from "./ThemeToggle";
import { LogOut, Menu, X, Home, Calendar, List, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setMenuOpen(false); // Sidebar schließen nach Logout
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const navLinkClasses =
    "flex items-center gap-2 rounded-lg px-4 py-2 transition text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800";
  const activeClasses = "bg-red-600 text-white font-bold";

  return (
    <nav className="bg-gray-100 dark:bg-gray-950 shadow-sm relative z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Mobile: Hamburger links */}
        <button
          className="md:hidden p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* Mobile: Logo zentriert */}
        <NavLink
          to="/"
          className="md:hidden flex items-center absolute left-1/2 transform -translate-x-1/2"
          onClick={() => setMenuOpen(false)}
        >
          <div className="bg-red-600 p-2 rounded-lg shadow-md dark:hidden">
            <img src="/freddy-logo-light.png" alt="Logo" className="h-8" />
          </div>
          <img
            src="/freddy-logo-dark.png"
            alt="Logo"
            className="h-9 hidden dark:block"
          />
        </NavLink>

        {/* Mobile: ThemeToggle rechts */}
        <div className="md:hidden">
          <ThemeToggle />
        </div>

        {/* Desktop: Logo links */}
        <NavLink to="/" className="hidden md:flex items-center">
          <div className="bg-red-600 p-2 rounded-lg shadow-md dark:hidden">
            <img src="/freddy-logo-light.png" alt="Logo" className="h-8" />
          </div>
          <img
            src="/freddy-logo-dark.png"
            alt="Logo"
            className="h-9 hidden dark:block"
          />
        </NavLink>

        {/* Desktop Navigation Mitte */}
        <div className="hidden md:flex gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeClasses : ""}`
            }
          >
            <Home size={18} />
            Home
          </NavLink>
          <NavLink
            to="/schichten"
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeClasses : ""}`
            }
          >
            <List size={18} />
            Schichten
          </NavLink>
          <NavLink
            to="/kalender"
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeClasses : ""}`
            }
          >
            <Calendar size={18} />
            Kalender
          </NavLink>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Normaler Toggle */}

          {/* Neuer animierter Switch */}
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              key={darkMode ? "sun" : "moon"}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4 }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </motion.button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
          >
            <LogOut size={18} />
            {loading ? "…" : "Abmelden"}
          </button>
        </div>
      </div>

      {/* Sidebar mit Animation */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-gray-100 dark:bg-gray-950 shadow-lg z-50 flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300 hover:text-red-600"
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>

              {/* Logo oben */}
              <div className="flex justify-center mt-6 mb-6">
                <div className="bg-red-600 p-2 rounded-lg shadow-md dark:hidden">
                  <img
                    src="/freddy-logo-light.png"
                    alt="Logo"
                    className="h-10"
                  />
                </div>
                <img
                  src="/freddy-logo-dark.png"
                  alt="Logo"
                  className="h-14 hidden dark:block"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 dark:border-gray-700 mb-4" />

              {/* Navigation */}
              <div className="flex flex-col gap-2 px-2">
                <NavLink
                  to="/"
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkClasses} ${isActive ? activeClasses : ""}`
                  }
                >
                  <Home size={18} />
                  Home
                </NavLink>
                <NavLink
                  to="/schichten"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkClasses} ${isActive ? activeClasses : ""}`
                  }
                >
                  <List size={18} />
                  Schichten
                </NavLink>
                <NavLink
                  to="/kalender"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkClasses} ${isActive ? activeClasses : ""}`
                  }
                >
                  <Calendar size={18} />
                  Kalender
                </NavLink>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-4" />

              {/* ThemeToggle normal in Sidebar */}
              <div className="px-4">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-4" />

              {/* Controls unten */}
              <div className="p-4 mt-auto">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
                >
                  <LogOut size={18} />
                  {loading ? "…" : "Abmelden"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
