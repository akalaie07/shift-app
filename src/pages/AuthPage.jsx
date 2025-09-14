// AuthPage.jsx

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Mitarbeiter");
  const [wage, setWage] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const evaluatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  // Session beobachten & Profil laden
  useEffect(() => {
    const getProfile = async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
        console.log("Profil geladen:", data);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        getProfile(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          getProfile(session.user.id);
        }
        if (event === "SIGNED_OUT") {
          setProfile(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

  try {
    if (isLogin) {
      // 🔑 LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // ✅ Nur hier Upsert, weil Session sicher aktiv ist
        await supabase.from("profiles").upsert(
          {
            user_id: user.id,
            first_name: firstName || null,
            last_name: lastName || null,
            role: role || "Mitarbeiter",
            wage: wage ? Number(wage) : 0,
          },
          { onConflict: "user_id" }
        );
      }

      setMessage("✅ Erfolgreich eingeloggt!");
    } else {
      // 🆕 REGISTRIERUNG
      if (password !== confirmPassword) {
        setMessage("❌ Passwörter stimmen nicht überein.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // ❌ Kein Upsert hier → Session existiert nicht bis Bestätigung
      setMessage("📩 Konto erstellt! Bitte bestätige deine E-Mail, um loszulegen.");
    }
  } catch (err) {
    setMessage(`❌ Fehler: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center 
                 transition-colors duration-500 relative
                 bg-gradient-to-br from-red-600 via-red-500 to-red-700 
                 dark:from-[#0a0f1a] dark:via-[#0a0f1a] dark:to-black"
    >
      <ThemeToggle />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-[#0a0f1a] p-8 rounded-2xl shadow-xl 
                   w-full max-w-md border border-gray-100 
                   dark:border-[#1f2937] dark:shadow-blue-900
                   transition-colors duration-500"
      >
        <div className="flex flex-col items-center mb-6">
          {theme === "light" ? (
            <div className="bg-red-600 rounded-xl p-4 shadow-lg">
              <img src="/freddy-logo-light.png" alt="Freddy Fresh Logo" className="h-20" />
            </div>
          ) : (
            <img src="/freddy-logo-dark.png" alt="Freddy Fresh Logo" className="h-24" />
          )}
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-4">
            {isLogin ? "Willkommen zurück!" : "Konto erstellen"}
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">
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
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div>
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordStrength(evaluatePasswordStrength(e.target.value));
                setPasswordMatch(e.target.value === confirmPassword);
              }}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            {!isLogin && (
              <div className="h-1 mt-1 rounded bg-gray-200">
                <div
                  className={`h-1 rounded transition-all ${
                    passwordStrength <= 1
                      ? "bg-red-500 w-1/4"
                      : passwordStrength === 2
                      ? "bg-yellow-500 w-2/4"
                      : passwordStrength === 3
                      ? "bg-blue-500 w-3/4"
                      : "bg-green-500 w-full"
                  }`}
                ></div>
              </div>
            )}
          </div>

          {!isLogin && (
            <>
              <input
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordMatch(password === e.target.value);
                }}
                required
                className={`w-full px-4 py-2 border rounded-lg ${
                  passwordMatch ? "border-gray-300" : "border-red-500"
                }`}
              />
              {!passwordMatch && (
                <p className="text-red-500 text-sm">❌ Passwörter stimmen nicht überein</p>
              )}
              {confirmPassword && passwordMatch && (
                <p className="text-green-600 text-sm">✅ Passwörter stimmen überein</p>
              )}

              <input
                type="text"
                placeholder="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Mitarbeiter">Mitarbeiter</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="number"
                placeholder="Stundenlohn (€)"
                value={wage}
                onChange={(e) => setWage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-red-600 text-white font-bold 
                       hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 
                       transition disabled:opacity-50"
          >
            {loading ? "Lädt..." : isLogin ? "Login" : "Registrieren"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        {profile && (
          <div className="mt-6 p-4 border rounded-lg text-sm text-gray-800 dark:text-gray-200">
            <p><b>Vorname:</b> {profile.first_name}</p>
            <p><b>Nachname:</b> {profile.last_name}</p>
            <p><b>Rolle:</b> {profile.role}</p>
            <p><b>Lohn:</b> {profile.wage} €</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p className="text-gray-600 dark:text-gray-300">
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
            <p className="text-gray-600 dark:text-gray-300">
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
