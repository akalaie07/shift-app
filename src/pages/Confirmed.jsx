// src/pages/Confirmed.jsx
export default function Confirmed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 dark:from-[#0a0f1a] dark:to-black">
      <div className="bg-white dark:bg-[#0a0f1a] p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
          ✅ Dein Account wurde bestätigt!
        </h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Du kannst dieses Fenster jetzt schließen und dich in der App anmelden.
        </p>
      </div>
    </div>
  );
}
