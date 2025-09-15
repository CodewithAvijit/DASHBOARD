import React, { useEffect, useMemo, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiBarChart2,
  FiGitMerge,
  FiShield,
  FiCpu,
} from "react-icons/fi";
import "./App.css";

// --- Helper Functions ---
const BASE_URL = "https://dashboard-xuhc.onrender.com";

const cls = (...arr) => arr.filter(Boolean).join(" ");

async function safeFetch(url, opts = {}) {
  const res = await fetch(url, opts).catch((e) => ({
    ok: false,
    statusText: String(e),
  }));
  if (!res || !res.ok) {
    throw new Error(`Request failed: ${res?.status} ${res?.statusText ?? ""}`);
  }
  return res.json();
}

function computeAgriScore(d) {
  if (!d) return 0;
  const {
    n = 0,
    p = 0,
    k = 0,
    temp = 0,
    humidity = 0,
    ph = 7,
    rainfall = 0,
  } = d;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nS = clamp(n / 120, 0, 1);
  const pS = clamp(p / 120, 0, 1);
  const kS = clamp(k / 120, 0, 1);
  const tempIdeal = 28;
  const tempS = clamp(1 - Math.abs(temp - tempIdeal) / 20, 0, 1);
  const humS = clamp(humidity / 100, 0, 1);
  const phS = clamp(1 - Math.abs(ph - 6.5) / 2.5, 0, 1);
  const rainS = clamp(rainfall / 250, 0, 1);
  const score =
    (nS + pS + kS) * 0.45 +
    tempS * 0.15 +
    humS * 0.1 +
    phS * 0.15 +
    rainS * 0.15;
  return Math.round(score * 100);
}

// --- Reusable UI Components ---
function StatCard({ label, value, unit }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  );
}

function Gauge({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  const angle = (pct / 100) * 180;
  const needleX = 150 + 120 * Math.cos(Math.PI - (angle * Math.PI) / 180);
  const needleY = 150 + 120 * Math.sin(Math.PI - (angle * Math.PI) / 180);
  const zoneColor =
    pct > 70 ? "var(--brand-primary)" : pct > 40 ? "#f59e0b" : "#dc2626";
  return (
    <svg viewBox="0 0 300 180" className="gauge-svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="var(--brand-primary)" />
        </linearGradient>
      </defs>
      <path
        d="M30 150 A120 120 0 0 1 270 150"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="150"
        x2={needleX}
        y2={needleY}
        stroke={zoneColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="150"
        cy="150"
        r="8"
        fill={pct > 0 ? "var(--card-bg)" : "#111827"}
      />
      <text
        x="150"
        y="170"
        textAnchor="middle"
        className="gauge-text"
        fontSize="14"
      >
        AgriScore: {pct}
      </text>
    </svg>
  );
}

const sidebarItems = [
  { key: "dashboard", label: "Overview", icon: <FiGrid /> },
  { key: "iot", label: "IoT Data", icon: <FiCpu /> },
  { key: "recommend", label: "Crop Recommendation", icon: <FiGitMerge /> },
  { key: "disease", label: "Disease Detection", icon: <FiShield /> },
  { key: "score", label: "AgriScore", icon: <FiBarChart2 /> },
];

// --- Main App Component ---
export default function AgriScoreDashboard() {
  const [active, setActive] = useState("dashboard");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [sensor, setSensor] = useState({
    n: 40,
    p: 50,
    k: 30,
    temp: 28,
    humidity: 70,
    ph: 6.5,
    rainfall: 120,
  });
  const agriScore = useMemo(() => computeAgriScore(sensor), [sensor]);
  const [cropReco, setCropReco] = useState(null);
  const [disease, setDisease] = useState(null);
  const [history, setHistory] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    setHistory([
      { t: "T-4", temp: 26, humidity: 72, ph: 6.7 },
      { t: "T-3", temp: 27, humidity: 70, ph: 6.6 },
      { t: "T-2", temp: 28, humidity: 69, ph: 6.5 },
      { t: "T-1", temp: 29, humidity: 68, ph: 6.6 },
    ]);

    getSensorHistory();
  }, []);

  const pushToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function getSensorHistory() {
    try {
      setBusy(true);
      const data = await safeFetch(`${BASE_URL}/sensor-data`);
      setSensorHistory(data);
      // You could also replace the dummy chart data like this:
      // setHistory(data);
      pushToast("Successfully fetched sensor history");
    } catch (e) {
      pushToast(`Fetch failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function saveSensorData() {
    try {
      setBusy(true);
      await safeFetch(`${BASE_URL}/sensor-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sensor),
      });
      pushToast("Sensor data saved");
      setHistory((h) => [
        ...h,
        {
          t: "Now",
          temp: sensor.temp,
          humidity: sensor.humidity,
          ph: sensor.ph,
        },
      ]);
    } catch (e) {
      pushToast(`Save failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function getCropRecommendation() {
    try {
      setBusy(true);
      await saveSensorData();
      const res = await safeFetch(`${BASE_URL}/recommend-crops`);
      setCropReco(res);
      pushToast("Got crop recommendations");
    } catch (e) {
      pushToast(`Recommend failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function uploadDisease(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setBusy(true);
      const res = await fetch(`${BASE_URL}/detect-disease`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setDisease(json);
      pushToast("Disease analyzed");
    } catch (e) {
      pushToast(`Upload failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  const handleSensorChange = (e) => {
    const { name, value } = e.target;
    setSensor((s) => ({ ...s, [name]: Number(value) }));
  };

  return (
    <div className="dashboard-container">
      {busy && <div className="loading-overlay">WORKING...</div>}
      <header className="main-header">
        <div className="header-content">
          <div className="header-logo">
            <span className="logo-icon">A</span>
            <div>
              <div className="logo-title">AgriScore Dashboard</div>
              <div className="logo-subtitle">IoT → ML → Insights</div>
            </div>
          </div>
          <div className="header-links">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle"
              title="Toggle theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>
      <div className="main-grid">
        <nav className="sidebar">
          <div className="card sidebar-card">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`sidebar-button ${
                  active === item.key ? "active" : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {active === "dashboard" && (
                <section
                  className="content-section"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  <div className="stats-grid">
                    <StatCard label="Nitrogen" value={sensor.n} unit="mg/kg" />
                    <StatCard
                      label="Phosphorus"
                      value={sensor.p}
                      unit="mg/kg"
                    />
                    <StatCard label="Potassium" value={sensor.k} unit="mg/kg" />
                    <StatCard label="Temp" value={sensor.temp} unit="°C" />
                    <StatCard
                      label="Humidity"
                      value={sensor.humidity}
                      unit="%"
                    />
                    <StatCard label="pH" value={sensor.ph} />
                  </div>
                  <div className="charts-grid">
                    <div className="card chart-card">
                      <div className="card-title">IoT Trends</div>
                      <div
                        className="chart-container"
                        style={{ height: "16rem" }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              ...history,
                              {
                                t: "Now",
                                temp: sensor.temp,
                                humidity: sensor.humidity,
                                ph: sensor.ph,
                              },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="t" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="temp"
                              stroke="#8884d8"
                            />
                            <Line
                              type="monotone"
                              dataKey="humidity"
                              stroke="#82ca9d"
                            />
                            <Line
                              type="monotone"
                              dataKey="ph"
                              stroke="#ffc658"
                            />

                            <Line
                              type="monotone"
                              dataKey="n"
                              stroke="#ff7300"
                            />
                            <Line
                              type="monotone"
                              dataKey="p"
                              stroke="#387908"
                            />
                            <Line
                              type="monotone"
                              dataKey="k"
                              stroke="#0088FE"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="card chart-card">
                      <div className="card-title">AgriScore Gauge</div>
                      <div className="gauge-wrapper">
                        <Gauge value={agriScore} />
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {active === "iot" && (
                <section className="card content-card">
                  <div className="card-title">
                    Enter / Tweak IoT Sensor Data
                  </div>
                  <div className="form-grid">
                    {Object.entries(sensor).map(([key, value]) => (
                      <label key={key} className="form-label">
                        {key.toUpperCase()}
                        <input
                          type="number"
                          name={key}
                          value={value}
                          step={key === "ph" ? "0.1" : "1"}
                          onChange={handleSensorChange}
                          className="form-input"
                          disabled={busy}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button
                      onClick={saveSensorData}
                      className="form-button primary"
                      disabled={busy}
                    >
                      Save to Backend
                    </button>
                  </div>
                </section>
              )}
              {active === "recommend" && (
                <section className="card content-card">
                  <div className="card-title">Crop Recommendation</div>
                  <p className="description">
                    We will POST /sensor-data then GET /recommend-crops.
                  </p>
                  <div className="form-grid">
                    {Object.entries(sensor).map(([key, value]) => (
                      <label key={key} className="form-label">
                        {key.toUpperCase()}
                        <input
                          type="number"
                          name={key}
                          value={value}
                          step={key === "ph" ? "0.1" : "1"}
                          onChange={handleSensorChange}
                          className="form-input"
                          disabled={busy}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button
                      onClick={getCropRecommendation}
                      className="form-button primary"
                      disabled={busy}
                    >
                      Recommend Crops
                    </button>
                  </div>
                  {cropReco && (
                    <div className="response-box">
                      <div className="response-title">
                        Recommendation Response
                      </div>
                      <pre>{JSON.stringify(cropReco, null, 2)}</pre>
                    </div>
                  )}
                </section>
              )}
              {active === "disease" && (
                <section className="card content-card">
                  <div className="card-title">Disease Detection</div>
                  <p className="description">
                    Upload a plant/leaf image. We will POST file to
                    /detect-disease.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => uploadDisease(e.target.files?.[0])}
                    disabled={busy}
                  />
                  {disease && (
                    <div className="response-box">
                      <div className="response-title">Disease Prediction</div>
                      <pre>{JSON.stringify(disease, null, 2)}</pre>
                    </div>
                  )}
                </section>
              )}
              {active === "score" && (
                <section className="charts-grid">
                  <div className="card chart-card">
                    <div className="card-title">
                      AgriScore (based on current IoT inputs)
                    </div>
                    <div className="gauge-wrapper">
                      <Gauge value={agriScore} />
                    </div>
                  </div>
                  <div className="card chart-card">
                    <div className="card-title">What affects the score?</div>
                    <ul
                      className="score-factors"
                      style={{ listStyle: "disc", paddingLeft: "1.5rem" }}
                    >
                      <li>Balanced N-P-K nutrients</li>
                      <li>Temperature near 28°C and adequate humidity</li>
                      <li>Soil pH around 6.5</li>
                      <li>Sufficient rainfall (contextual to crop/region)</li>
                    </ul>
                    <p className="description" style={{ marginTop: "1rem" }}>
                      Note: This is a heuristic for display.
                    </p>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {toast && (
        <div className="toast-container">
          <div
            className={cls("toast-message", toast.type === "error" && "error")}
          >
            {toast.msg}
          </div>
        </div>
      )}
      <footer className="main-footer">AgriAssure • AgriScore Dashboard</footer>
    </div>
  );
}
