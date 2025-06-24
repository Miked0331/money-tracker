import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const Chart = ({ entries }) => {
  const incomeTotal = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const expenseTotal = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const net = incomeTotal - expenseTotal;

  const data = {
    labels: ["Income", "Expenses", "Net Total"],
    datasets: [
      {
        label: "Amount",
        data: [incomeTotal, expenseTotal, net],
        backgroundColor: ["#22c55e", "#ef4444", net >= 0 ? "#3b82f6" : "#f97316"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `$${parseFloat(context.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `$${val}`,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default Chart;
