import React, { useState, useEffect } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import { isWithinInterval, startOfDay } from "date-fns";

// Parse YYYY-MM-DD without shifting timezone
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("income");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filter, setFilter] = useState("all");

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

    const localDate = parseLocalDate(date);
    localDate.setHours(12); // Prevent timezone shift (UTC -> previous day)

    const newEntry = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date: localDate.toISOString().split("T")[0],
      type,
    };

    setEntries([...entries, newEntry]);
    setDescription("");
    setAmount("");
    setDate("");
    setType("income");
  };

  const handleRemove = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      setDateRange([range[0], range[range.length - 1]]);
    } else if (range.start && range.end) {
      setDateRange([range.start, range.end]);
    }
  };

  const entriesInRange = entries.filter((entry) => {
    const entryDate = startOfDay(parseLocalDate(entry.date));
    return isWithinInterval(entryDate, {
      start: startOfDay(dateRange[0]),
      end: startOfDay(dateRange[1]),
    });
  });

  const filteredEntries =
    filter === "all"
      ? entriesInRange
      : entriesInRange.filter((entry) => entry.type === filter);

  const totalAmount = filteredEntries.reduce((sum, entry) => {
    return entry.type === "expense" ? sum - entry.amount : sum + entry.amount;
  }, 0);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Money Tracker</h1>

      <form onSubmit={handleAddEntry} className="mb-6 space-y-3 max-w-md mx-auto">
        <input
          className="border border-gray-300 p-3 rounded w-full"
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border border-gray-300 p-3 rounded w-full"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="border border-gray-300 p-3 rounded w-full"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="border border-gray-300 p-3 rounded w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded w-full"
        >
          Add Entry
        </button>
      </form>

      <div className="flex justify-center gap-2 mb-4">
        {["all", "income", "expense"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded ${
              filter === t ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <AgendaCalendar
        entries={filteredEntries}
        onRangeChange={handleRangeChange}
        onRemove={handleRemove}
      />

      <div className="mt-4 p-4 bg-gray-100 rounded text-center">
        <h2 className="text-lg font-semibold mb-2">
          Net Total in View: {" "}
          <span className={totalAmount < 0 ? "text-red-600" : "text-green-600"}>
            ${totalAmount.toFixed(2)}
          </span>
        </h2>
      </div>

      <Chart entries={filteredEntries} />

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Entries</h2>
        <ul className="space-y-2">
          {filteredEntries.map((entry) => (
            <li
              key={entry.id}
              className={`flex justify-between items-center p-3 rounded shadow-sm ${
                entry.type === "expense" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <div>
                <p className="font-medium">
                  {entry.description} – ${entry.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{entry.date}</p>
              </div>
              <button
                onClick={() => handleRemove(entry.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
