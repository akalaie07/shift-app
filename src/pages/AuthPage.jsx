// src/pages/AuthPage.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let error;
    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
      if (!error) {
        setMessage("✅ Bestätigungslink wurde an deine E-Mail gesendet!");
      }
    }

    if (error) setMessage(`❌ ${error.message}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-red-400">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <img src="/src/assets/freddy-logo.png" alt="Freddy Fresh Logo" className="mx-auto h-16 mb-6" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">
          {isLogin ? "Willkommen zurück!" : "Konto erstellen"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isLogin
            ? "Melde dich mit deinem Account an."
            : "Registriere dich und werde Teil von Freddy Fresh."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Bitte warten…" : isLogin ? "Login" : "Registrieren"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm">{message}</p>}

        <div className="mt-6 text-gray-600 text-sm">
          {isLogin ? (
            <>
              Kein Account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-red-600 hover:underline font-semibold"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon registriert?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-red-600 hover:underline font-semibold"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
