import React from "react";
import { parseISO, format } from "date-fns";

export default function History({ entries }) {
  // Sort entries by date descending (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="mt-8 max-w-md mx-auto p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">History</h2>
      {sortedEntries.length === 0 ? (
        <p className="text-gray-500">No entries to display.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {sortedEntries.map(({ id, description, amount, date, type }) => (
            <li
              key={id}
              className={`flex justify-between p-2 rounded ${
                type === "expense" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <div>
                <p className="font-medium">{description}</p>
                <p className="text-sm text-gray-600">
                  {format(parseISO(date), "MMM dd, yyyy")}
                </p>
              </div>
              <div
                className={`font-semibold ${
                  type === "expense" ? "text-red-600" : "text-green-600"
                }`}
              >
                ${amount.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
