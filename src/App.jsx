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

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newEntry = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date,
    };

    setEntries([...entries, newEntry]);
    setDescription("");
    setAmount("");
    setDate("");
  };

  const handleRemove = (id) => {
    const updated = entries.filter((entry) => entry.id !== id);
    setEntries(updated);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Money Tracker</h1>

      <form onSubmit={handleAddEntry} className="mb-6 space-y-3">
        <input
          className="border p-2 w-full"
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add Entry
        </button>
      </form>

      <AgendaCalendar entries={entries} onRemove={handleRemove} />
    </div>
  );
}

export default App;
