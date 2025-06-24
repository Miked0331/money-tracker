import React, { useState, useEffect, useRef } from "react";
import AgendaCalendar from "./components/AgendaCalendar";
import Chart from "./components/Chart";
import History from "./components/History";
import { isWithinInterval, startOfDay } from "date-fns";

// Parse YYYY-MM-DD without shifting timezone
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [templates, setTemplates] = useState([]); // templates state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("income");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filter, setFilter] = useState("all");
  const [saveTemplate, setSaveTemplate] = useState(false);

  // Voice input states
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

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

  // Setup SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition API not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setError(null);
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      handleVoiceInput(speechToText);
      setListening(false);
    };

    recognition.onerror = (event) => {
      setError(`Error occurred: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Parse and add entry from voice input text
  const handleVoiceInput = (text) => {
  const lower = text.toLowerCase().trim();

  // Regex patterns with optional "dollar(s)" and relaxed description
  const incomePatterns = [
    /made (\d+\.?\d*) ?(?:dollars?)? ?(?:for|from)? ?(.+)?/,
    /earned (\d+\.?\d*) ?(?:dollars?)? ?(?:for|from)? ?(.+)?/,
    /income (\d+\.?\d*) ?(?:dollars?)? ?(?:for|from)? ?(.+)?/,
  ];

  const expensePatterns = [
    /spent (\d+\.?\d*) ?(?:dollars?)? ?(?:on)? ?(.+)?/,
    /pay(?:ed)? (\d+\.?\d*) ?(?:dollars?)? ?(?:for)? ?(.+)?/,
    /expense (\d+\.?\d*) ?(?:dollars?)? ?(?:for)? ?(.+)?/,
  ];

  let type = null;
  let amount = null;
  let description = null;

  for (const pattern of incomePatterns) {
    const match = lower.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      description = match[2] ? match[2].trim() : "income";
      type = "income";
      break;
    }
  }

  if (type === null) {
    for (const pattern of expensePatterns) {
      const match = lower.match(pattern);
      if (match) {
        amount = parseFloat(match[1]);
        description = match[2] ? match[2].trim() : "expense";
        type = "expense";
        break;
      }
    }
  }

  // Fallback: try to parse any number and guess description as leftover text
  if (type === null) {
    const fallbackMatch = lower.match(/(\d+\.?\d*)/);
    if (fallbackMatch) {
      amount = parseFloat(fallbackMatch[1]);
      // remove the number from text to use as description
      description = lower.replace(fallbackMatch[1], "").replace(/(made|earned|spent|pay(ed)?|dollars?)/g, "").trim();
      type = lower.includes("spent") || lower.includes("pay") ? "expense" : "income";
      if (!description) description = type;
    }
  }

  if (amount && description && type) {
    const today = new Date();
    today.setHours(12);
    const isoDate = today.toISOString().split("T")[0];

    const newEntry = {
      id: Date.now(),
      description,
      amount,
      date: isoDate,
      type,
    };

    setEntries((prev) => [...prev, newEntry]);
    setError(null);
  } else {
    setError("Sorry, couldn't understand your voice entry. Please try again.");
  }
};


  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Rest of your existing handlers...

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

  const handleAddFromTemplate = (template) => {
    const today = new Date();
    today.setHours(12);
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

      {/* Voice Input Section */}
      <div className="mb-6 max-w-md mx-auto p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">🎙️ Voice Input</h2>
        <button
          onClick={toggleListening}
          className={`mb-3 px-4 py-2 rounded font-semibold ${
            listening ? "bg-red-500 text-white" : "bg-green-600 text-white"
          } hover:opacity-90`}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </button>

        <div className="min-h-[40px] mb-2 p-2 bg-white border rounded text-gray-800">
          {transcript || <span className="text-gray-400 italic">Your speech will appear here...</span>}
        </div>

        {error && (
          <p className="text-red-600 font-semibold">{error}</p>
        )}
      </div>

      {/* Existing form */}
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

      {/* Filter Buttons */}
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
