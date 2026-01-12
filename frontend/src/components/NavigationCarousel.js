import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./NavigationCarousel.css";

const NavigationCarousel = ({ route }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!route || !route.steps || route.steps.length === 0) {
    return (
      <div className="no-route">
        <h3>🚫 Navigation Guide Not Available</h3>
        <p>Please select a different destination.</p>
      </div>
    );
  }

  const { steps, startLocation, endLocation } = route;

  return (
    <div className="navigation-carousel">
      <div className="route-header">
        <h2>
          🧭 Navigating: {startLocation} → {endLocation}
        </h2>
        <div className="progress-info">
          <span className="step-counter">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <Carousel
        selectedItem={currentStep}
        onChange={setCurrentStep}
        showThumbs={false}
        showArrows={true}
        showStatus={false}
        infiniteLoop={false}
        useKeyboardArrows={true}
        swipeable={true}
        emulateTouch={true}
      >
        {steps.map((step, index) => (
          <div key={index} className="step-slide">
            <div className="step-visual">
              <div className="step-number">Step {index + 1}</div>
              <div className="step-image-container">
                {step.imageUrl ? (
                  // Show actual image from database
                  <img
                    src={step.imageUrl}
                    alt={`Step ${index + 1}: ${step.instruction}`}
                    className="step-image"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.target.style.display = "none";
                      e.target.parentElement.querySelector(
                        ".image-fallback"
                      ).style.display = "block";
                    }}
                  />
                ) : (
                  // Show placeholder if no image URL
                  <div className="image-placeholder">
                    📷 Navigation Image
                    <div className="image-note">
                      (Image: {step.imageUrl || "Not provided"})
                    </div>
                  </div>
                )}

                {/* Add a hidden fallback in case image fails */}
                <div
                  className="image-fallback"
                  style={{ display: step.imageUrl ? "none" : "block" }}
                >
                  <div className="direction-overlay">
                    <div className="direction-arrow">➡️</div>
                    <div className="direction-text">This Way</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-instruction">
              <div className="instruction-card">
                <h3 className="instruction-text">{step.instruction}</h3>
                <div className="step-details">
                  {step.distance && (
                    <div className="detail-item">
                      <span className="detail-icon">📏</span>
                      <span className="detail-label">Distance:</span>
                      <span className="detail-value">{step.distance}</span>
                    </div>
                  )}
                  {step.estimatedTime && (
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{step.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="step-tip">
                <span className="tip-icon">💡</span>
                <span className="tip-text">
                  {index === steps.length - 1
                    ? "You have arrived at your destination!"
                    : "Follow this direction to the next step."}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="navigation-controls">
        <button
          className="nav-btn prev-btn"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          ◀ Previous Step
        </button>

        <div className="step-dots">
          {steps.map((_, index) => (
            <button
              key={index}
              className={`step-dot ${index === currentStep ? "active" : ""}`}
              onClick={() => setCurrentStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="nav-btn next-btn"
          onClick={() =>
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
          }
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? "🏁 Finish" : "Next Step ▶"}
        </button>
      </div>
    </div>
  );
};
// In your frontend, add this to NavigationCarousel.js

export default NavigationCarousel;
