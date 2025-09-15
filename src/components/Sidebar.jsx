// src/components/Sidebar.jsx
import React from "react";
import {
  FiGrid,
  FiBarChart2,
  FiGitMerge,
  FiShield,
  FiCpu,
} from "react-icons/fi";

const sidebarItems = [
  { key: "dashboard", label: "Overview", icon: <FiGrid /> },
  { key: "iot", label: "IoT Data", icon: <FiCpu /> },
  { key: "recommend", label: "Crop Recommendation", icon: <FiGitMerge /> },
  { key: "disease", label: "Disease Detection", icon: <FiShield /> },
  { key: "score", label: "AgriScore", icon: <FiBarChart2 /> },
];

export default function Sidebar({ active, setActive }) {
  return (
    <nav className="sidebar">
      <div className="card sidebar-card">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`sidebar-button ${active === item.key ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
