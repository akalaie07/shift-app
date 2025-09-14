import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Confirmed() {
  const location = useLocation();

  useEffect(() => {
    console.log("Bestätigung angekommen:", location.hash);
    // hier könntest du auch supabase.auth.setSession(location.hash) machen,
    // wenn du User automatisch einloggen willst
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-600 text-white">
      <div className="bg-white text-red-600 p-8 rounded-2xl shadow-xl text-center max-w-md">
        <img
          src="/freddy-logo-light.png"
          alt="Freddy Fresh Logo"
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-4">Dein Account ist bestätigt 🎉</h1>
        <p className="text-gray-700 mb-4">
          Du kannst dieses Fenster jetzt schließen und dich anmelden.
        </p>
      </div>
    </div>
  );
}
