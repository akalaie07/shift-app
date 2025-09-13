// src/utils/formatMinutes.js
export default function formatMinutes(mins) {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}min`;
}
