// src/Auth.jsx
import { supabase } from './supabaseClient';

export default function Auth() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: prompt('Deine E-Mail:'),
    });
    if (error) alert(error.message);
    else alert('Schau in deine Mails für den Login-Link!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        onClick={handleLogin}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
      >
        Login mit E-Mail
      </button>
    </div>
  );
}
