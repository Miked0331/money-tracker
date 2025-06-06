import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({ text: '', amount: '', date: '' });

  useEffect(() => {
    const saved = localStorage.getItem('tracker-entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tracker-entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      text: form.text,
      amount: parseFloat(form.amount),
      date: form.date,
    };
    setEntries([newEntry, ...entries]);
    setForm({ text: '', amount: '', date: '' });
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const getEntriesByDate = (date) => {
    return entries.filter((entry) => isSameDay(parseISO(entry.date), date));
  };

  const getWeeklyTotal = () => {
    return entries
      .filter((entry) => isSameWeek(parseISO(entry.date), new Date(), { weekStartsOn: 1 }))
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  };

  const getMonthlyTotal = () => {
    return entries
      .filter((entry) => isSameMonth(parseISO(entry.date), new Date()))
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasEntry = entries.some((entry) => isSameDay(parseISO(entry.date), date));
      return hasEntry ? 'highlight' : null;
    }
  };

  return (
    <div className="app">
      <h1>Money & Notes Tracker</h1>

      <div className="summary">
        <p>This Week: ${getWeeklyTotal().toFixed(2)}</p>
        <p>This Month: ${getMonthlyTotal().toFixed(2)}</p>
      </div>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      <form onSubmit={addEntry}>
        <input
          type="text"
          name="text"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="What did you do?"
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Amount"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Add Entry</button>
      </form>

      <div className="entries">
        <h2>Entries for {format(selectedDate, 'yyyy-MM-dd')}</h2>
        {getEntriesByDate(selectedDate).map((entry) => (
          <div key={entry.id}>
            <p>{entry.text}</p>
            <p>${entry.amount.toFixed(2)}</p>
            <button onClick={() => deleteEntry(entry.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
