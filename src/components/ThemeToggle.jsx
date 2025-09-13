import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // Hole den aktuellen Wert aus localStorage oder nehme System-Default
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || 
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  // Immer wenn Theme sich ändert → Klasse setzen + speichern
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-4 right-4 px-3 py-1 rounded-md text-sm font-semibold 
                 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 
                 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
    >
      {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}
