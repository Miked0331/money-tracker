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
  const events = entries.map((e) => {
  const [year, month, day] = e.date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return {
    title: `${e.description} - $${parseFloat(e.amount).toFixed(2)}`,
    start: localDate,
    end: localDate,
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
        style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "8px" }}
      />
    </div>
  );
};

export default AgendaCalendar;
