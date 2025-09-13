import { useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("✅ Erfolgreich eingeloggt!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("📩 Bitte bestätige deine E-Mail, um loszulegen.");
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-700 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700"
      >
        {/* Logo + Heading */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/freddy-logo.png"
            alt="Freddy Fresh Logo"
            className="h-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {isLogin ? "Willkommen zurück!" : "Konto erstellen"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isLogin
              ? "Melde dich mit deinem Account an."
              : "Registriere dich für den Schichtplaner."}
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? "Lädt..." : isLogin ? "Login" : "Registrieren"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}

        {/* Umschalten */}
        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p className="text-gray-600 dark:text-gray-400">
              Noch kein Account?{" "}
              <button
                type="button"
                className="text-red-600 dark:text-red-400 font-bold"
                onClick={() => setIsLogin(false)}
              >
                Registrieren
              </button>
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Schon registriert?{" "}
              <button
                type="button"
                className="text-red-600 dark:text-red-400 font-bold"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
