import { useState, useEffect } from 'react';

function App() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: '',
    work: '',
    income: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { ...form };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('entries', JSON.stringify(updated));
    setForm({ date: '', work: '', income: '' });
  };

  return (
    <div className="p-4 max-w-md mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">💵 Money Tracker</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="work"
          value={form.work}
          placeholder="What did you do today?"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={2}
          required
        />
        <input
          type="number"
          name="income"
          value={form.income}
          placeholder="How much did you make?"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Save Entry
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">📅 Entries</h2>
        {entries.length === 0 && <p className="text-gray-500">No entries yet.</p>}
        {entries.map((entry, index) => (
          <div
            key={index}
            className="border p-3 rounded mb-2 shadow-sm bg-white"
          >
            <p className="text-sm text-gray-600">{entry.date}</p>
            <p>{entry.work}</p>
            <p className="font-bold text-green-600">${entry.income}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
