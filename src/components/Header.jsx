// src/components/Header.jsx
import React from "react";

export default function Header({ isDarkMode, setIsDarkMode }) {
  return (
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
  );
}
