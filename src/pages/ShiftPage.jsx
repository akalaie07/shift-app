import React from "react";
import ShiftList from "../components/ShiftList";

export default function ShiftPage({ shifts, onUpdate, onDelete }) {
  return (
    <div className="p-4">
      <ShiftList shifts={shifts} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}
