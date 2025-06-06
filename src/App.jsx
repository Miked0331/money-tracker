import React, { useState, useEffect } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import { format, isSameDay, isSameWeek, isSameMonth, parseISO } from "date-fns";

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", date: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem("tracker-entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tracker-entries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
    };
    setEntries([newEntry, ...entries]);
    setForm({ description: "", amount: "", date: "" });
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const getEntriesByDate = (date) =>
    entries.filter((entry) => isSameDay(parseISO(entry.date), date));

  const getWeeklyTotal = () =>
    entries
      .filter((entry) => isSameWeek(parseISO(entry.date), new Date(), { weekStartsOn: 1 }))
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const getMonthlyTotal = () =>
    entries
      .filter((entry) => isSameMonth(parseISO(entry.date), new Date()))
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">💰 Money Tracker</h1>

      <div className="flex justify-between text-lg font-medium">
        <p>This Week: ${getWeeklyTotal().toFixed(2)}</p>
        <p>This Month: ${getMonthlyTotal().toFixed(2)}</p>
      </div>

      <form onSubmit={addEntry} className="space-y-4">
        <input
          type="text"
          placeholder="What did you do?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Entry
        </button>
      </form>

      <AgendaCalendar entries={entries} />

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Entries for {format(selectedDate, "yyyy-MM-dd")}
        </h2>
        <div className="space-y-2">
          {getEntriesByDate(selectedDate).map((entry) => (
            <div key={entry.id} className="bg-gray-100 p-3 rounded flex justify-between">
              <div>
                <div className="font-medium">{entry.description}</div>
                <div className="text-sm text-gray-600">
                  {entry.date} – ${entry.amount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;