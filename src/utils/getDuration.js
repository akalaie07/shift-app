import { parseISO } from "date-fns";

export default function getDurationMinutes(shift, now = new Date()) {
  try {
    if (shift.durationMinutes != null) return Number(shift.durationMinutes);
    const start = shift.actualStart
      ? parseISO(shift.actualStart)
      : shift.start
      ? parseISO(shift.start)
      : null;
    let end = null;
    if (shift.end) end = parseISO(shift.end);
    else if (shift.running) end = now;
    if (!start || !end) return 0;
    const pause = Number(shift.pauseMinutes || 0);
    return Math.max(Math.round((end.getTime() - start.getTime()) / 60000) - pause, 0);
  } catch {
    return 0;
  }
}
