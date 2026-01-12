import React from "react";
import "./LocationSelect.css";

const LocationSelect = ({ currentLocation, onSelectDestination }) => {
  if (!currentLocation || !currentLocation.destinations) {
    return <div>Loading destinations...</div>;
  }

  return (
    <div className="location-select">
      <div className="select-header">
        <h2>📍 Where would you like to go from here?</h2>
        <p className="current-location">
          You are at: <strong>{currentLocation.name}</strong>
        </p>
      </div>

      <div className="destinations-grid">
        {currentLocation.destinations.map((destination) => (
          <div
            key={destination._id}
            className="destination-card"
            onClick={() => onSelectDestination(destination)}
          >
            <div className="card-icon">
              {destination.category === "office" && "🏢"}
              {destination.category === "lab" && "🔬"}
              {destination.category === "cafeteria" && "🍽️"}
              {destination.category === "library" && "📚"}
              {destination.category === "entrance" && "🚪"}
              {!["office", "lab", "cafeteria", "library", "entrance"].includes(
                destination.category
              ) && "📍"}
            </div>
            <div className="card-content">
              <h3>{destination.name}</h3>
              <p className="card-category">{destination.category}</p>
              {destination.qrCode && (
                <p className="qr-hint">QR: {destination.qrCode}</p>
              )}
            </div>
            <div className="card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="select-info">
        <p>
          💡 <strong>Tip:</strong> Each location has its own QR code. Scan it
          when you arrive!
        </p>
      </div>
    </div>
  );
};

export default LocationSelect;
