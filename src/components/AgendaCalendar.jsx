import React from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AgendaCalendar = ({ entries, onRangeChange, darkMode }) => {
  // Adjust entry dates to force time to noon, which avoids timezone offsets
  const events = entries.map((entry) => {
    const [year, month, day] = entry.date.split("-").map(Number);
    const correctedDate = new Date(year, month - 1, day, 12); // set time to noon
    return {
      title: `${entry.description} - $${entry.amount.toFixed(2)}${entry.client ? ` (${entry.client})` : ""}`,
      start: correctedDate,
      end: correctedDate,
      allDay: true,
      resource: entry.type,
    };
  });

  const darkText = "#e5e7eb";
  const lightText = "#0f172a";

  return (
    <div
      className={`calendar-shell rounded-lg shadow ${darkMode ? "bg-gray-900" : "bg-white"}`}
      style={{ height: "clamp(500px, 72vh, 740px)" }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        className={darkMode ? "calendar-dark" : ""}
        style={{
          backgroundColor: "transparent",
          padding: "10px",
          borderRadius: "8px",
          color: darkMode ? darkText : lightText,
        }}
        onRangeChange={onRangeChange}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor:
              event.resource === "expense"
                ? darkMode
                  ? "#7f1d1d"
                  : "#fecaca"
                : darkMode
                  ? "#064e3b"
                  : "#bbf7d0",
            color: darkMode ? darkText : lightText,
            border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
          },
        })}
      />
    </div>
  );
};

export default AgendaCalendar;