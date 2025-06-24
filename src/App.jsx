import React, { useState, useEffect } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import { isWithinInterval, startOfDay } from "date-fns";
import History from "./components/History";

// Parse YYYY-MM-DD without shifting timezone
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [templates, setTemplates] = useState([]); // NEW: templates state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("income");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filter, setFilter] = useState("all");
  const [saveTemplate, setSaveTemplate] = useState(false); // NEW: checkbox to save template

  // Load entries and templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("entries");
    if (saved) setEntries(JSON.parse(saved));
    const savedTemplates = localStorage.getItem("templates");
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  // Save entries and templates to localStorage
  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

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

    // Save as template if checkbox is checked & not already saved
    if (saveTemplate) {
      const exists = templates.some(
        (t) =>
          t.description === description &&
          t.amount === parseFloat(amount) &&
          t.type === type
      );
      if (!exists) {
        setTemplates([...templates, { description, amount: parseFloat(amount), type }]);
      }
    }

    setDescription("");
    setAmount("");
    setDate("");
    setType("income");
    setSaveTemplate(false);
  };

  // Quickly add an entry from a template using today's date
  const handleAddFromTemplate = (template) => {
    const today = new Date();
    today.setHours(12); // same timezone fix
    const isoDate = today.toISOString().split("T")[0];

    const newEntry = {
      id: Date.now(),
      description: template.description,
      amount: template.amount,
      date: isoDate,
      type: template.type,
    };
    setEntries([...entries, newEntry]);
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

        {/* Checkbox to save template */}
        <label className="inline-flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={saveTemplate}
            onChange={(e) => setSaveTemplate(e.target.checked)}
          />
          <span>Save as template</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded w-full mt-2"
        >
          Add Entry
        </button>
      </form>

      {/* Quick Add Template Buttons */}
      {templates.length > 0 && (
        <div className="mb-6 max-w-md mx-auto">
          <h2 className="font-semibold mb-2">Quick Add Templates</h2>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, i) => (
              <button
                key={i}
                onClick={() => handleAddFromTemplate(template)}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                {template.description} (${template.amount.toFixed(2)}) [{template.type}]
              </button>
            ))}
          </div>
        </div>
      )}

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
          Net Total in View:{" "}
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
       <History entries={filteredEntries} />
    </div>
  );
}

export default App;
