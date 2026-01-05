"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ForecastChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="temp_max" stroke="#ff7300" />
          <Line dataKey="temp_min" stroke="#387908" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="rain_probability" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
