import React, { useState, useEffect } from "react";
import AgendaCalendar from "./components/AgendaCalendar";

function App() {
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("entries");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newEntry = {
      description,
      amount: parseFloat(amount),
      date,
    };

    setEntries((prev) => [...prev, newEntry]);
    setDescription("");
    setAmount("");
    setDate("");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Money Tracker</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">
          Add Entry
        </button>
      </form>

      <AgendaCalendar entries={entries} />
    </div>
  );
}

export default App;
