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
  <div className="p-4 max-w-md mx-auto text-gray-800">
    <h1 className="text-xl font-bold mb-4">Money & Notes Tracker</h1>

    {/* Form to add entries */}
    <form onSubmit={addEntry} className="space-y-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What did you do?"
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount (optional)"
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button className="w-full bg-blue-500 text-white p-2 rounded">
        Save Entry
      </button>
    </form>

    {/* Calendar Filter */}
    <div className="mt-6">
      <h2 className="font-semibold mb-2">📅 View Entries by Date</h2>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
    </div>

    {/* Entries list */}
    <div className="mt-2">
      {entries.filter(entry => entry.date === date).length === 0 && (
        <p className="text-sm text-gray-500">No entries for {date}.</p>
      )}

      {entries
        .filter(entry => entry.date === date)
        .map(entry => (
          <div key={entry.id} className="border p-2 rounded mb-2">
            <div className="flex justify-between">
              <strong>{entry.date}</strong>
              <button onClick={() => deleteEntry(entry.id)} className="text-red-500 text-sm">Delete</button>
            </div>
            <p>{entry.text}</p>
            {entry.amount > 0 && (
              <p className="text-green-600">+ ${entry.amount.toFixed(2)}</p>
            )}
          </div>
        ))}
    </div>
  </div>
);

}

import { useEffect, useState } from 'react'

function App() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Load entries from localStorage on start
  useEffect(() => {
    const saved = localStorage.getItem('tracker-entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save entries to localStorage on change
  useEffect(() => {
    localStorage.setItem('tracker-entries', JSON.stringify(entries));
  }, [entries]);

  function addEntry(e) {
    e.preventDefault();
    if (!text.trim() || !amount || !date) return;

    const newEntry = {
      id: Date.now(),
      text,
      amount: parseFloat(amount),
      date,
    };

    setEntries([newEntry, ...entries]);
    setText('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  }

  function deleteEntry(id) {
    setEntries(entries.filter(entry => entry.id !== id));
  }

  return (
    <div className="p-4 max-w-md mx-auto text-gray-800">
      <h1 className="text-xl font-bold mb-4">Money & Notes Tracker</h1>

      <form onSubmit={addEntry} className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What did you do?"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount (optional)"
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Save Entry
        </button>
      </form>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Entries</h2>
        {entries.length === 0 && <p className="text-sm text-gray-500">No entries yet.</p>}
        {entries.map(entry => (
          <div key={entry.id} className="border p-2 rounded mb-2">
            <div className="flex justify-between">
              <strong>{entry.date}</strong>
              <button onClick={() => deleteEntry(entry.id)} className="text-red-500 text-sm">Delete</button>
            </div>
            <p>{entry.text}</p>
            {entry.amount > 0 && <p className="text-green-600">+ ${entry.amount.toFixed(2)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;
