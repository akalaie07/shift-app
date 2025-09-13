// src/utils/shiftUtils.js
import { parseISO } from "date-fns";

export function parseISOorNull(v) {
  try {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;
    const d = parseISO(v);
    return isNaN(d) ? null : d;
  } catch {
    return null;
  }
}

export function getShiftStart(shift) {
  return parseISOorNull(shift?.actualStart || shift?.start);
}

export function getShiftEnd(shift, now = new Date()) {
  if (shift?.end) return parseISOorNull(shift.end);
  if (shift?.running) return now;
  return null;
}

export function getDurationMinutes(shift, now = new Date()) {
  const start = getShiftStart(shift);
  const end = getShiftEnd(shift, now);
  if (!start || !end) return 0;
  const pause = Number(shift?.pauseMinutes || 0);
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000) - pause;
  return Math.max(minutes, 0);
}
