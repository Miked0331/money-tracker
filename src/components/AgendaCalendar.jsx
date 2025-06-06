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

const AgendaCalendar = ({ entries }) => {
  const events = entries.map((e) => ({
    title: `${e.description} - $${e.amount.toFixed(2)}`,
    start: new Date(e.date),
    end: new Date(e.date),
  }));

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.AGENDA, Views.MONTH]}
        defaultView={Views.AGENDA}
        style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "8px" }}
      />
    </div>
  );
};

export default AgendaCalendar;