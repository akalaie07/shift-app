// src/pages/AuthPage.jsx
import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Mitarbeiter");
  const [wage, setWage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

        // Session holen
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Profil speichern / updaten
          const { error: upsertError } = await supabase.from("profiles").upsert(
            {
              user_id: user.id,
              first_name: firstName || null,
              last_name: lastName || null,
              role: role || "Mitarbeiter",
              wage: wage ? Number(wage) : 0,
            },
            { onConflict: "user_id" }
          );
          if (upsertError) throw upsertError;
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

        // 🚨 Profil NICHT sofort speichern → erst nach Login
        setMessage(
          "📩 Konto erstellt! Bitte bestätige deine E-Mail. Danach kannst du dich einloggen."
        );
      }
    } catch (err) {
      console.error("Auth Fehler:", err.message);
      setMessage("❌ Fehler: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleAuth}
      className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded"
    >
      <h2 className="text-xl font-bold mb-2">
        {isLogin ? "Einloggen" : "Konto erstellen"}
      </h2>

      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {!isLogin && (
        <>
          <input
            type="password"
            placeholder="Passwort bestätigen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Vorname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nachname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Mitarbeiter">Mitarbeiter</option>
            <option value="Manager">Manager</option>
          </select>
          <input
            type="number"
            placeholder="Stundenlohn"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
          />
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Bitte warten..." : isLogin ? "Einloggen" : "Registrieren"}
      </button>

      {message && <p>{message}</p>}

      <p
        className="text-sm text-blue-500 cursor-pointer"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Noch kein Konto? Registrieren"
          : "Schon registriert? Einloggen"}
      </p>
    </form>
  );
}
