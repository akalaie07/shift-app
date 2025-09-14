import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Confirmed() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Bestätigung angekommen:", location.hash);
    // Optional: Session setzen, wenn Auto-Login gewünscht ist
    // supabase.auth.setSession(location.hash)
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-700 dark:from-[#0a0f1a] dark:to-black transition-colors duration-500">
      <div className="bg-white dark:bg-[#0a0f1a] text-center p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-[#1f2937] max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/freddy-logo-light.png"
            alt="Freddy Fresh Logo"
            className="h-20 drop-shadow-lg dark:hidden"
          />
          <img
            src="/freddy-logo-dark.png"
            alt="Freddy Fresh Logo"
            className="h-20 drop-shadow-lg hidden dark:block"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4">
          Dein Account ist bestätigt 🎉
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Willkommen beim Freddy Fresh Schichtplaner!  
          Du kannst dieses Fenster jetzt schließen oder dich direkt anmelden.
        </p>

        <div className="flex flex-col items-center gap-4">
          <span className="px-6 py-2 rounded-xl bg-green-600 text-white font-semibold shadow-md">
            ✅ Erfolgreich bestätigt
          </span>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold shadow-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    </div>
  );
}
