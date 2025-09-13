import React from "react";
import Calendar from "../components/Calendar";

export default function CalendarPage({ shifts, currentMonthStart, setMonthStart }) {
  return (
    <div className="p-4">
      <Calendar
        shifts={shifts}
        currentMonthStart={currentMonthStart}
        setMonthStart={setMonthStart}
      />
    </div>
  );
}
