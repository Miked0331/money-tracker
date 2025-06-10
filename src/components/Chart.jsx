import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, startOfDay, addDays } from "date-fns";

const Chart = ({ entries, dateRange }) => {
  // Create array of days in the range
  const days = [];
  let current = startOfDay(dateRange[0]);
  const end = startOfDay(dateRange[1]);

  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }

  // Map each day to total amount
  const data = days.map((day) => {
    const totalForDay = entries
      .filter((e) => startOfDay(new Date(e.date)).getTime() === day.getTime())
      .reduce((sum, e) => sum + e.amount, 0);

    return { date: format(day, "MM/dd"), amount: totalForDay };
  });

  return (
    <div style={{ width: "100%", height: 300, marginTop: 20 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Bar dataKey="amount" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
