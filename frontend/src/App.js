import React, { useState } from "react";
import "./App.css";
import QRScanner from "./components/QRScanner";
import LocationSelect from "./components/LocationSelect";
import NavigationCarousel from "./components/NavigationCarousel";
import QRGenerator from "./components/QRGenerator";

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedDestination, setSelectedDestination] = useState(null); // ✅ Fixed
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [scanMode, setScanMode] = useState(true);

  // Handle QR code scan result
  const handleQRScan = async (qrData) => {
    try {
      console.log("QR Code scanned:", qrData);

      // Parse QR data (assuming it contains locationId or qrCode)
      let locationId;
      try {
        const parsedData = JSON.parse(qrData);
        locationId = parsedData.qrCode || parsedData.locationId;
      } catch {
        // If not JSON, treat as direct QR code
        locationId = qrData;
      }

      // Fetch location from backend
      const response = await fetch(
        `http://localhost:3200/api/locations/qr/${locationId}`
      );
      if (!response.ok) {
        throw new Error("Location not found");
      }

      const location = await response.json();
      setCurrentLocation(location);
      setScanMode(false);
      setNavigationRoute(null);
      setSelectedDestination(null);
    } catch (error) {
      console.error("Scan error:", error);
      alert(
        `Could not find location. Please try scanning again.\nQR Code: ${qrData}`
      );
    }
  };

  // Handle destination selection
  const handleSelectDestination = async (destination) => {
    setSelectedDestination(destination);

    try {
      console.log("🚀 Fetching COMPLETE route data...");

      // OPTION A: Fetch by location IDs (most reliable)
      const response = await fetch(
        `http://localhost:3200/api/routes/${currentLocation._id}/${destination._id}`
      );

      let routeData;

      if (response.ok) {
        routeData = await response.json();
        console.log("✅ Full route data received:", routeData);
      } else {
        // OPTION B: Try by QR codes if IDs fail
        console.log("🔄 Trying QR code endpoint...");
        const qrResponse = await fetch(
          `http://localhost:3200/api/routes/qr/${currentLocation.qrCode}/${destination.qrCode}`
        );

        if (qrResponse.ok) {
          routeData = await qrResponse.json();
        } else {
          throw new Error("Route not found in backend");
        }
      }

      // 3. Extract ALL step data
      const enhancedSteps = routeData.steps.map((step, index) => ({
        // Image URL from backend
        imageUrl:
          step.imageUrl ||
          `/steps/${currentLocation.qrCode}-${destination.qrCode}-${
            index + 1
          }.jpg`,

        // Instruction from backend
        instruction:
          step.instruction ||
          `Step ${index + 1}: From ${currentLocation.name} to ${
            destination.name
          }`,

        // Distance from backend (with fallback)
        distance: step.distance || `${(index + 1) * 15} meters`,

        // Estimated time from backend (with fallback)
        estimatedTime: step.estimatedTime || `${(index + 1) * 45} seconds`,

        // Additional data that might be in backend
        description: step.description || `Navigation step ${index + 1}`,

        // Step number
        stepNumber: index + 1,

        // Location references
        fromLocation: currentLocation.name,
        toLocation: destination.name,
      }));

      // 4. Create complete navigation route object
      const completeRoute = {
        // Route metadata
        _id: routeData._id || `route-${currentLocation._id}-${destination._id}`,
        startLocation: routeData.startLocation?.name || currentLocation.name,
        endLocation: routeData.endLocation?.name || destination.name,

        // Location details
        startLocationDetails: routeData.startLocation || {
          name: currentLocation.name,
          description: currentLocation.description,
          qrCode: currentLocation.qrCode,
          category: currentLocation.category,
        },

        endLocationDetails: routeData.endLocation || {
          name: destination.name,
          description: destination.description,
          qrCode: destination.qrCode,
          category: destination.category,
        },

        // ALL step data
        steps: enhancedSteps,

        // Calculated totals
        totalDistance:
          routeData.totalDistance ||
          enhancedSteps.reduce((sum, step) => {
            const dist = parseInt(step.distance) || 0;
            return sum + dist;
          }, 0) + " meters",

        totalTime:
          routeData.totalTime ||
          enhancedSteps.reduce((sum, step) => {
            const match = step.estimatedTime?.match(/(\d+)/);
            return sum + (match ? parseInt(match[1]) : 0);
          }, 0) + " seconds",

        stepCount: enhancedSteps.length,
      };

      console.log("📊 Complete route prepared:", completeRoute);
      setNavigationRoute(completeRoute);
    } catch (error) {
      console.error("❌ Failed to fetch from backend:", error);

      // 5. Create mock data with ALL fields as fallback
      console.log("⚠️ Creating comprehensive fallback data");

      const fallbackSteps = [
        {
          imageUrl: `/steps/${currentLocation.qrCode}-${destination.qrCode}-1.jpg`,
          instruction: `From ${currentLocation.name}: ${currentLocation.description}`,
          distance: "20 meters",
          estimatedTime: "1 minute",
          description: `Starting from ${currentLocation.name}`,
          stepNumber: 1,
        },
        {
          imageUrl: `/steps/${currentLocation.qrCode}-${destination.qrCode}-2.jpg`,
          instruction: `To ${destination.name}: ${destination.description}`,
          distance: "25 meters",
          estimatedTime: "1 minute 30 seconds",
          description: `Heading to ${destination.name}`,
          stepNumber: 2,
        },
      ];

      // Add third step for specific routes
      if (
        currentLocation.qrCode === "ENTRANCE-001" &&
        destination.qrCode === "TAKH-101"
      ) {
        fallbackSteps.push({
          imageUrl: `/steps/${currentLocation.qrCode}-${destination.qrCode}-3.jpg`,
          instruction: "Arrive at Takhleeq Office, the entrepreneurship center",
          distance: "10 meters",
          estimatedTime: "30 seconds",
          description: "Final approach to destination",
          stepNumber: 3,
        });
      }

      setNavigationRoute({
        startLocation: currentLocation.name,
        endLocation: destination.name,
        steps: fallbackSteps,
        totalDistance:
          fallbackSteps.reduce(
            (sum, s) => sum + (parseInt(s.distance) || 0),
            0
          ) + " meters",
        totalTime: "2-3 minutes",
        stepCount: fallbackSteps.length,
        note: "Using fallback data - backend route not found",
      });
    }
  };
  // Reset to scan mode
  const handleNewScan = () => {
    setScanMode(true);
    setCurrentLocation(null);
    setSelectedDestination(null);
    setNavigationRoute(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Campus Compass</h1>
        <p>Scan QR → Get Directions → Reach Destination</p>
      </header>

      <main className="App-main">
        {scanMode ? (
          // QR Scanning Screen
          <QRScanner onScan={handleQRScan} />
        ) : currentLocation && !navigationRoute ? (
          // Destination Selection Screen
          <div className="location-screen">
            <div className="current-location-info">
              <h2>📍 You are at: {currentLocation.name}</h2>
              <p>{currentLocation.description}</p>
              <button onClick={handleNewScan} className="scan-again-btn">
                ↻ Scan Different QR Code
              </button>
            </div>
            <LocationSelect
              currentLocation={currentLocation}
              onSelectDestination={handleSelectDestination}
            />
          </div>
        ) : navigationRoute ? (
          // Navigation Guide Screen
          <div className="navigation-screen">
            <div className="route-header">
              <h2>
                Navigating: {navigationRoute.startLocation} →{" "}
                {navigationRoute.endLocation}
              </h2>
              <button
                onClick={() => {
                  setNavigationRoute(null);
                  setSelectedDestination(null);
                }}
                className="back-btn"
              >
                ← Choose Different Destination
              </button>
            </div>
            <NavigationCarousel route={navigationRoute} />
            <div className="navigation-actions">
              <button onClick={handleNewScan} className="action-btn">
                🏁 Start New Journey
              </button>
              <QRGenerator location={currentLocation} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
