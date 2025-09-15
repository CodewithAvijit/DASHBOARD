// src/pages/IoTData.jsx
import React, { useState } from "react";
import "./IoTData.css";

export default function IoTData() {
  // State for the form inputs
  const [formData, setFormData] = useState({
    n: 40,
    p: 50,
    k: 30,
    temp: 28,
    humidity: 70,
    ph: 6.5,
    rainfall: 120,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="iot-data-container">
      <h1>IoT Data</h1>

      {/* Sensor Data Grid */}
      <div className="sensor-grid">
        <div className="sensor-card">
          <h4>Nitrogen</h4>
          <p>
            40 <span>mg/kg</span>
          </p>
        </div>
        <div className="sensor-card">
          <h4>Phosphorus</h4>
          <p>
            50 <span>mg/kg</span>
          </p>
        </div>
        <div className="sensor-card">
          <h4>Potassium</h4>
          <p>
            30 <span>mg/kg</span>
          </p>
        </div>
        <div className="sensor-card">
          <h4>Temp</h4>
          <p>
            28 <span>°C</span>
          </p>
        </div>
        <div className="sensor-card">
          <h4>Humidity</h4>
          <p>
            70 <span>%</span>
          </p>
        </div>
        <div className="sensor-card">
          <h4>pH</h4>
          <p>6.5</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>IoT Trends</h3>
          <div className="placeholder">Graph will be here</div>
        </div>
        <div className="chart-card">
          <h3>AgriScore Gauge</h3>
          <div className="placeholder">Gauge will be here</div>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="form-card">
        <h3>Enter / Tweak IoT Sensor Data</h3>
        <div className="form-grid">
          <label>
            N{" "}
            <input
              type="number"
              name="n"
              value={formData.n}
              onChange={handleInputChange}
            />
          </label>
          <label>
            P{" "}
            <input
              type="number"
              name="p"
              value={formData.p}
              onChange={handleInputChange}
            />
          </label>
          <label>
            K{" "}
            <input
              type="number"
              name="k"
              value={formData.k}
              onChange={handleInputChange}
            />
          </label>
          <label>
            TEMP{" "}
            <input
              type="number"
              name="temp"
              value={formData.temp}
              onChange={handleInputChange}
            />
          </label>
          <label>
            HUMIDITY{" "}
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              onChange={handleInputChange}
            />
          </label>
          <label>
            PH{" "}
            <input
              type="number"
              name="ph"
              step="0.1"
              value={formData.ph}
              onChange={handleInputChange}
            />
          </label>
          <label>
            RAINFALL{" "}
            <input
              type="number"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div className="form-buttons">
          <button className="btn-secondary">Save to Backend</button>
          <button className="btn-primary">Save + Recommend Crops</button>
        </div>
      </div>
    </div>
  );
}
