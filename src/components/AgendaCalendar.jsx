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
    title: `${e.description} - $${parseFloat(e.amount).toFixed(2)}`,
    start: new Date(e.date),
    end: new Date(e.date),
  }));

  const eventStyleGetter = (event) => {
    const isExpense = event.title.includes("-");
    const backgroundColor = isExpense ? "#ef4444" : "#10b981"; // Red for expense, green for income
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
        padding: "4px",
      },
    };
  };

  return (
    <div
      style={{
        height: 600,
        padding: "20px",
        marginTop: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default AgendaCalendar;
