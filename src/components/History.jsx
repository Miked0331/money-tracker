import React from "react";

export default function History({ entries }) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">🕑 History (Last 10 Entries)</h2>
      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No entries found.</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {entries
            .slice()
            .reverse()
            .slice(0, 10)
            .map((entry) => (
              <li
                key={entry.id}
                className={`p-2 rounded flex justify-between items-center ${
                  entry.type === "expense" ? "bg-red-100 dark:bg-red-700" : "bg-green-100 dark:bg-green-700"
                }`}
              >
                <div>
                  <p className="font-medium">{entry.description}</p>
                  <p className="text-sm">{entry.date}</p>
                </div>
                <span className="font-semibold">
                  {entry.type === "expense" ? "-" : "+"}${entry.amount.toFixed(2)}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
