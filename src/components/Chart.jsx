import React from "react";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Chart({ entries }) {
  // Aggregate amounts per date (net: income - expense)
  const amountsByDate = {};

  entries.forEach(({ date, amount, type }) => {
    if (!amountsByDate[date]) amountsByDate[date] = 0;
    amountsByDate[date] += type === "expense" ? -amount : amount;
  });

  const sortedDates = Object.keys(amountsByDate).sort();
  const data = {
    labels: sortedDates.map((d) => format(parseISO(d), "MMM d")),
    datasets: [
      {
        label: "Net Amount",
        data: sortedDates.map((d) => amountsByDate[d].toFixed(2)),
        backgroundColor: sortedDates.map((d) =>
          amountsByDate[d] < 0 ? "rgba(220, 38, 38, 0.7)" : "rgba(34, 197, 94, 0.7)"
        ),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `$${val}`,
        },
      },
    },
  };

  return (
    <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
      <h2 className="font-semibold mb-4 text-center">📊 Net Amount by Date</h2>
      <Bar data={data} options={options} />
    </div>
  );
}
