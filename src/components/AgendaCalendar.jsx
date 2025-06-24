import React from "react";
import { format, parseISO } from "date-fns";

export default function AgendaCalendar({ entries, onRangeChange, onRemove }) {
  // Group entries by date for agenda style
  const grouped = entries.reduce((acc, entry) => {
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">📅 Agenda</h2>
      {sortedDates.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 italic">No entries in this date range.</p>
      )}
      {sortedDates.map((date) => (
        <div key={date} className="mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
          <h3 className="font-semibold mb-1">{format(parseISO(date), "eeee, MMMM d, yyyy")}</h3>
          <ul className="space-y-1">
            {grouped[date].map((entry) => (
              <li
                key={entry.id}
                className={`flex justify-between items-center p-2 rounded ${
                  entry.type === "expense" ? "bg-red-100 dark:bg-red-700" : "bg-green-100 dark:bg-green-700"
                }`}
              >
                <div>
                  <p className="font-medium">{entry.description}</p>
                  <p className="text-sm">${entry.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
