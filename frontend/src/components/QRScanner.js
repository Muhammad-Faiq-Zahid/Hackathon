import React, { useState } from "react";
import "./QRScanner.css";

const QRScanner = ({ onScan }) => {
  const [manualCode, setManualCode] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // For hackathon demo - simulate scanning different QR codes
  const demoQRs = [
    { code: "ENTRANCE-001", name: "Main Entrance" }, // Changed from LOBBY-001
  ];

  const handleDemoScan = (qrCode) => {
    setIsSimulating(true);
    // Simulate scan delay
    setTimeout(() => {
      onScan(qrCode);
      setIsSimulating(false);
    }, 800);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleDemoScan(manualCode);
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-container">
        <div className="demo-section">
          <h3>🎯 Choose where you wanna go</h3>
          <p className="demo-note"></p>

          <div className="demo-qr-buttons">
            {demoQRs.map((qr, index) => (
              <button
                key={index}
                onClick={() => handleDemoScan(qr.code)}
                disabled={isSimulating}
                className="demo-qr-btn"
              >
                <div className="qr-icon">📱</div>
                <div className="qr-info">
                  <strong>{qr.name}</strong>
                  <small>QR: {qr.code}</small>
                </div>
                {isSimulating && (
                  <div className="scanning-indicator">Scanning...</div>
                )}
              </button>
            ))}
          </div>

          <div className="manual-scan">
            <h4>Or enter QR code manually:</h4>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter QR code (e.g., LOBBY-001)"
                className="manual-input"
              />
              <button type="submit" className="manual-submit">
                Simulate Scan
              </button>
            </form>
          </div>
        </div>

        <div className="how-it-works">
          <h3>📋 How It Works:</h3>
          <ol>
            <li>Find a QR code at any location hotspot</li>
            <li>Scan it with your phone camera</li>
            <li>Select where you want to go</li>
            <li>Follow the visual step-by-step guide</li>
            <li>Reach your destination easily!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
