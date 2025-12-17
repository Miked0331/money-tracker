import React, { useState, useEffect, useRef } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import History from "./components/History";
import { isWithinInterval, startOfDay } from "date-fns";
import logo from "./assets/logo.png";



const DEFAULT_TEMPLATES = [
  { description: "Groceries", amount: 50, type: "expense" },
  { description: "Coffee", amount: 5, type: "expense" },
  { description: "Paycheck", amount: 500, type: "income" },
];

// Date parsing
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function App() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("entries");
    return saved ? JSON.parse(saved) : [];
  });
  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem("templates");
    return savedTemplates ? JSON.parse(savedTemplates) : DEFAULT_TEMPLATES;
  });
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("income");
  const [client, setClient] = useState("");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filter, setFilter] = useState("all");
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Entry editing
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    description: "",
    amount: "",
    date: "",
    type: "income",
    client: "",
  });

  // Voice input
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechSupportNote, setSpeechSupportNote] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition is not supported in this browser. Try Chrome on desktop or Android.");
      setSpeechSupportNote("Safari and some browsers do not yet support in-page voice input.");
      return;
    }
    if (!window.isSecureContext) {
      setError("Voice input requires HTTPS. Open the deployed site or localhost over HTTPS.");
      setSpeechSupportNote("Browser blocked the microphone because the page is not served securely.");
      return;
    }
    setSpeechSupported(true);
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
    if (!recognitionRef.current) return setError("Speech Recognition is unavailable.");
    try {
      listening ? recognitionRef.current.stop() : recognitionRef.current.start();
    } catch (err) {
      setError("Microphone blocked or unavailable. Allow mic access and try again.");
      setSpeechSupportNote(err?.message || "");
    }
  };

  const handleVoiceInput = (text) => {
    const lower = text.toLowerCase().trim();
    const incomeP = [/made (\d+\.?\d*) ?(?:dollars?)?(?: for| from)? (.+)?/, /earned (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/];
    const expenseP = [/spent (\d+\.?\d*) ?(?:dollars?)?(?: on)? (.+)?/, /paid (\d+\.?\d*) ?(?:dollars?)? ?(.+)?/];

    let type = null, amount = null, description = null;

    for (const p of incomeP) {
      const match = lower.match(p);
      if (match) {
        amount = parseFloat(match[1]);
        description = match[2]?.trim() || "income";
        type = "income";
        break;
      }
    }

    if (!type) {
      for (const p of expenseP) {
        const match = lower.match(p);
        if (match) {
          amount = parseFloat(match[1]);
          description = match[2]?.trim() || "expense";
          type = "expense";
          break;
        }
      }
    }

    if (!type && /\d+/.test(lower)) {
      const amt = lower.match(/(\d+(\.\d+)?)/)[0];
      amount = parseFloat(amt);
      description = lower.replace(amt, "").replace(/(made|earned|spent|paid|dollars?)/g, "").trim() || "entry";
      type = lower.includes("spent") || lower.includes("paid") ? "expense" : "income";
    }

    if (type && amount && description) {
      const today = new Date();
      today.setHours(12);
      setEntries((prev) => [
        ...prev,
        {
          id: Date.now(),
          description,
          amount,
          date: today.toISOString().split("T")[0],
          type,
        },
      ]);
    } else {
      setError("Could not understand voice input.");
    }
  };

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
      client: client.trim(),
    };
    setEntries((prev) => [...prev, newEntry]);

    if (saveTemplate) {
      setTemplates((prev) => {
        const exists = prev.some(
          (t) =>
            t.description === description &&
            t.amount === parseFloat(amount) &&
            t.type === type
        );
        return exists
          ? prev
          : [...prev, { description, amount: parseFloat(amount), type, client: client.trim() }];
      });
    }

    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("income");
    setClient("");
    setSaveTemplate(false);
  };

  const handleAddFromTemplate = (template) => {
    const today = new Date();
    today.setHours(12);
    const isoDate = today.toISOString().split("T")[0];
    setEntries((prev) => [
      ...prev,
      {
        ...template,
        client: template.client || "",
        id: Date.now(),
        date: isoDate,
      },
    ]);
  };

  const handleDeleteTemplate = (index) => {
    setTemplates((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditingEntry = (entry) => {
    setEditingEntryId(entry.id);
    setEditingFields({
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date,
      type: entry.type,
      client: entry.client || "",
    });
  };

  const handleEditingFieldChange = (field, value) => {
    setEditingFields((prev) => ({ ...prev, [field]: value }));
  };

  const saveEditingEntry = () => {
    if (!editingEntryId) return;
    const { description, amount, date, type, client } = editingFields;
    if (!description || !amount || !date) return;

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === editingEntryId
          ? {
              ...entry,
              description,
              amount: parseFloat(amount),
              date,
              type,
              client: client.trim(),
            }
          : entry
      )
    );

    setEditingEntryId(null);
    setEditingFields({
      description: "",
      amount: "",
      date: "",
      type: "income",
      client: "",
    });
  };

  const cancelEditingEntry = () => {
    setEditingEntryId(null);
    setEditingFields({
      description: "",
      amount: "",
      date: "",
      type: "income",
      client: "",
    });
  };

  const handleRemove = (id) => setEntries((prev) => prev.filter((entry) => entry.id !== id));
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
  const totalAmount = filteredEntries.reduce((sum, entry) => entry.type === "expense" ? sum - entry.amount : sum + entry.amount,
 0);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <img
  src={logo}
  alt="Lawn Ledger logo"
  className="h-12 w-12 rounded-lg shadow-sm"
/>

              <div>
                <h1 className="text-3xl font-bold">Lawn Ledger</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Track every lawn job and expense at a glance.</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* Voice Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h2 className="font-semibold mb-2">🎙️ Voice Input</h2>
            <button
              onClick={toggleListening}
              disabled={!speechSupported}
              className={`mb-3 px-4 py-2 rounded font-semibold transition ${
                listening ? "bg-red-500" : "bg-green-600"
              } text-white disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {!speechSupported
                ? "Speech not supported"
                : listening
                  ? "Stop Listening"
                  : "Start Listening"}
            </button>
            <div className="p-2 rounded bg-white dark:bg-gray-700 mb-2 min-h-[2rem]">
              {transcript || <span className="text-gray-500">Speak to add entry…</span>}
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {speechSupportNote && <p className="text-xs text-gray-600 dark:text-gray-300">{speechSupportNote}</p>}
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
            />
            <input
              className="w-full p-3 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="Client / Location (optional)"
              value={client}
              onChange={(e) => setClient(e.target.value)}
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
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-semibold">⚡ Quick Add</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Keep templates tucked away until you need them.
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplates((prev) => !prev)}
                  className="text-sm px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
                >
                  {showTemplates ? "Hide" : "Show"}
                </button>
              </div>
              {showTemplates && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
                    >
                      <div className="space-y-1 text-left">
                        <p className="font-semibold text-sm">{t.description}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          ${t.amount} · {t.type}
                        </p>
                        {t.client && (
                          <p className="text-xs text-gray-500 dark:text-gray-300">Client: {t.client}</p>
                        )}
                        <button
                          onClick={() => handleAddFromTemplate(t)}
                          className="text-xs px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                        >
                          Add from template
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(i)}
                        className="text-xs text-red-500 hover:text-red-600"
                        aria-label={`Delete template ${t.description}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {t}
              </button>
            ))}
          </div>

          <AgendaCalendar
            darkMode={darkMode}
            entries={filteredEntries}
            onRangeChange={handleRangeChange}
            onRemove={handleRemove}
          />

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
                  className={`p-3 rounded shadow-sm flex justify-between items-start gap-4 ${
                    entry.type === "expense" ? "bg-red-100 dark:bg-red-800" : "bg-green-100 dark:bg-green-800"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    {editingEntryId === entry.id ? (
                      <div className="space-y-2">
                        <input
                          className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                          value={editingFields.description}
                          onChange={(e) => handleEditingFieldChange("description", e.target.value)}
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                            type="number"
                            value={editingFields.amount}
                            onChange={(e) => handleEditingFieldChange("amount", e.target.value)}
                            placeholder="Amount"
                          />
                          <input
                            className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                            type="date"
                            value={editingFields.date}
                            onChange={(e) => handleEditingFieldChange("date", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                            value={editingFields.client}
                            onChange={(e) => handleEditingFieldChange("client", e.target.value)}
                            placeholder="Client / Location"
                          />
                          <select
                            className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                            value={editingFields.type}
                            onChange={(e) => handleEditingFieldChange("type", e.target.value)}
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={saveEditingEntry}
                            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingEntry}
                            className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{entry.description} – ${entry.amount.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-800 dark:text-gray-100 items-center">
                          <span className={`px-2 py-1 rounded ${entry.type === "income" ? "bg-green-200 dark:bg-green-700" : "bg-red-200 dark:bg-red-700"}`}>
                            {entry.type}
                          </span>
                          <span className="px-2 py-1 rounded bg-white/70 dark:bg-black/40">{entry.date}</span>
                          {entry.client && (
                            <span className="px-2 py-1 rounded bg-white/70 dark:bg-black/40">Client: {entry.client}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {editingEntryId === entry.id ? null : (
                      <button
                        onClick={() => startEditingEntry(entry)}
                        className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
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