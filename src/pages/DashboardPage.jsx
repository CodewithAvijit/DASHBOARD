// src/pages/DashboardPage.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import StatCard from "../components/StatCard";
import Gauge from "../components/Gauge";

export default function DashboardPage({ sensor, history, agriScore }) {
  return (
    <section
      className="content-section"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div className="stats-grid">
        <StatCard label="Nitrogen" value={sensor.n} unit="mg/kg" />
        <StatCard label="Phosphorus" value={sensor.p} unit="mg/kg" />
        <StatCard label="Potassium" value={sensor.k} unit="mg/kg" />
        <StatCard label="Temp" value={sensor.temp} unit="°C" />
        <StatCard label="Humidity" value={sensor.humidity} unit="%" />
        <StatCard label="pH" value={sensor.ph} />
      </div>
      <div className="charts-grid">{/* ... Chart and Gauge JSX ... */}</div>
    </section>
  );
}
