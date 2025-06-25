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

const AgendaCalendar = ({ entries, onRangeChange }) => {
  // Adjust entry dates to force time to noon, which avoids timezone offsets
  const events = entries.map((entry) => {
    const [year, month, day] = entry.date.split("-").map(Number);
    const correctedDate = new Date(year, month - 1, day, 12); // set time to noon

    return {
      title: `${entry.description} - $${entry.amount.toFixed(2)}`,
      start: correctedDate,
      end: correctedDate,
      allDay: true,
      resource: entry.type,
    };
  });

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "8px",
        }}
        onRangeChange={onRangeChange}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor:
              event.resource === "expense" ? "#fecaca" : "#bbf7d0",
            color: "#000",
          },
        })}
      />
    </div>
  );
};

export default AgendaCalendar;
