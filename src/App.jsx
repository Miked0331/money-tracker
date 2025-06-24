import React, { useState, useEffect, useRef } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import History from "./components/History";
import { isWithinInterval, startOfDay } from "date-fns";

// Date parsing helper
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("income");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filter, setFilter] = useState("all");
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Voice input states
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Load entries, templates, and dark mode from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("entries");
    const savedTemplates = localStorage.getItem("templates");
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedDarkMode) setDarkMode(savedDarkMode === "true");
  }, []);

  // Save entries and templates when they change
  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Setup SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      setError(null);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceInput(text);
      setListening(false);
    };

    recognition.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  // Voice input parser and entry adder
  const handleVoiceInput = (text) => {
    const lower = text.toLowerCase().trim();
    const incomeP = [
      /made (\d+\.?\d*) ?(?:dollars?)?(?: for| from)? (.+)?/,
      /earned (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/,
      /income (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/
    ];
    const expenseP = [
      /spent (\d+\.?\d*) ?(?:dollars?)?(?: on)? (.+)?/,
      /paid (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/,
      /expense (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/
    ];

    let type = null, amount = null, description = null;

    for (const p of incomeP) {
      const match = lower.match(p);
      if (match) {
        amount = parseFloat(match[1]);
        description = match[2]?.trim() || "Income";
        type = "income";
        break;
      }
    }

    if (!type) {
      for (const p of expenseP) {
        const match = lower.match(p);
        if (match) {
          amount = parseFloat(match[1]);
          description = match[2]?.trim() || "Expense";
          type = "expense";
          break;
        }
      }
    }

    if (!type && /\d+/.test(lower)) {
      const amt = lower.match(/(\d+(\.\d+)?)/)[0];
      amount = parseFloat(amt);
      description = lower.replace(amt, "").replace(/(made|earned|spent|paid|dollars?)/g, "").trim();
      if (!description) description = "Entry";
      type = lower.includes("spent") || lower.includes("paid") ? "expense" : "income";
    }

    if (type && amount && description) {
      const today = new Date();
      today.setHours(12);

      // Use functional update to avoid stale closure
      setEntries((prev) => [
        ...prev,
        {
          id: Date.now(),
          description,
          amount,
          date: today.toISOString().split("T")[0],
          type
        }
      ]);

      setError(null);
      setTranscript(""); // Clear transcript after adding entry
    } else {
      setError("Could not understand voice input. Please try again.");
    }
  };

  // Manual form entry handler
  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const localDate = parseLocalDate(date);
    localDate.setHours(12);
    const newEntry = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date: localDate.toISOString().split("T")[0],
      type,
    };
    setEntries((prev) => [...prev, newEntry]);

    if (saveTemplate) {
      const exists = templates.some(
        (t) =>
          t.description === description &&
          t.amount === parseFloat(amount) &&
          t.type === type
      );
      if (!exists) {
        setTemplates((prev) => [...prev, { description, amount: parseFloat(amount), type }]);
      }
    }

    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("income");
    setSaveTemplate(false);
  };

  const handleAddFromTemplate = (template) => {
    const today = new Date();
    today.setHours(12);
    const isoDate = today.toISOString().split("T")[0];
    setEntries((prev) => [...prev, { ...template, id: Date.now(), date: isoDate }]);
  };

  const handleRemove = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleRangeChange = (range) => {
    if (Array.isArray(range)) setDateRange([range[0], range[range.length - 1]]);
    else if (range.start && range.end) setDateRange([range.start, range.end]);
  };

  const entriesInRange = entries.filter((entry) => {
    const entryDate = startOfDay(parseLocalDate(entry.date));
    return isWithinInterval(entryDate, {
      start: startOfDay(dateRange[0]),
      end: startOfDay(dateRange[1]),
    });
  });

  const filteredEntries = filter === "all" ? entriesInRange : entriesInRange.filter((e) => e.type === filter);
  const totalAmount = filteredEntries.reduce((sum, entry) => entry.type === "expense" ? sum - entry.amount : sum + entry.amount, 0);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">💰 Money Tracker</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* Voice Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h2 className="font-semibold mb-2">🎙️ Voice Input</h2>
            <button
              onClick={toggleListening}
              className={`mb-3 px-4 py-2 rounded font-semibold transition ${
                listening ? "bg-red-500" : "bg-green-600"
              } text-white`}
            >
              {listening ? "Stop Listening" : "Start Listening"}
            </button>
            <div className="p-2 rounded bg-white dark:bg-gray-700 mb-2 min-h-[2rem]">
              {transcript || <span className="text-gray-500">Speak to add entry…</span>}
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          {/* Entry Form */}
          <form onSubmit={handleAddEntry} className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow mb-6">
            <input
              className="w-full p-3 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="w-full p-3 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <input
              className="w-full p-3 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="w-full p-3 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={saveTemplate}
                onChange={(e) => setSaveTemplate(e.target.checked)}
              />
              <span>Save as template</span>
            </label>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition">Add Entry</button>
          </form>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">⚡ Quick Add</h2>
              <div className="flex flex-wrap gap-2">
                {templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddFromTemplate(t)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  >
                    {t.description} (${t.amount}) [{t.type}]
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex justify-center gap-2 mb-4">
            {["all", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded ${
                  filter === t ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <AgendaCalendar entries={filteredEntries} onRangeChange={handleRangeChange} onRemove={handleRemove} />

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-center">
            <h2 className="text-lg font-semibold">
              Net Total:{" "}
              <span className={totalAmount < 0 ? "text-red-500" : "text-green-500"}>
                ${totalAmount.toFixed(2)}
              </span>
            </h2>
          </div>

          <Chart entries={filteredEntries} />

          <div className="mt-6">
            <h2 className="font-semibold mb-2">📋 Entries</h2>
            <ul className="space-y-2">
              {filteredEntries.map((entry) => (
                <li
                  key={entry.id}
                  className={`p-3 rounded shadow-sm flex justify-between items-center transition-transform hover:scale-[1.01] ${
                    entry.type === "expense" ? "bg-red-100 dark:bg-red-800" : "bg-green-100 dark:bg-green-800"
                  }`}
                >
                  <div>
                    <p className="font-medium">{entry.description} – ${entry.amount.toFixed(2)}</p>
                    <p className="text-sm">{entry.date}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <History entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}

export default App;
