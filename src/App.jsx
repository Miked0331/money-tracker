import React, { useState, useEffect } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import { isWithinInterval, startOfDay } from "date-fns";

// Helper: parse yyyy-mm-dd as local date (no timezone shift)
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // monthIndex is 0-based
}

function App() {
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  useEffect(() => {
    const saved = localStorage.getItem("entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newEntry = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date, // store as string for consistency
    };

    setEntries([...entries, newEntry]);
    setDescription("");
    setAmount("");
    setDate("");
  };

  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      setDateRange([range[0], range[range.length - 1]]);
    } else if (range.start && range.end) {
      setDateRange([range.start, range.end]);
    }
  };

  // Filter entries by current date range, using parseLocalDate to avoid timezone issues
  const entriesInRange = entries.filter((entry) => {
    const entryDate = startOfDay(parseLocalDate(entry.date));
    return isWithinInterval(entryDate, { start: startOfDay(dateRange[0]), end: startOfDay(dateRange[1]) });
  });

  const totalAmount = entriesInRange.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Money Tracker</h1>

      <form onSubmit={handleAddEntry} className="mb-6 space-y-3 max-w-md mx-auto">
  <input
    className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    type="text"
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
  <input
    className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />
  <input
    className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
  />
  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded w-full transition"
  >
    Add Entry
  </button>
</form>


      {/* Pass handleRangeChange to AgendaCalendar so you can track calendar view range */}
      <AgendaCalendar entries={entries} onRangeChange={handleRangeChange} />

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">
          Total Amount in View: ${totalAmount.toFixed(2)}
        </h2>
      </div>

      <Chart entries={entriesInRange} dateRange={dateRange} />
    </div>
  );
}

export default App;
