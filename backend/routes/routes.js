const express = require("express");
const router = express.Router();
const Route = require("../models/Route");

// Get navigation route between locations
router.get("/:startId/:endId", async (req, res) => {
  try {
    const route = await Route.findOne({
      startLocation: req.params.startId,
      endLocation: req.params.endId,
    }).populate("startLocation endLocation");

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In backend/routes/routes.js - Complete route endpoint
router.get("/:startId/:endId", async (req, res) => {
  try {
    console.log(
      `🔍 Finding route: ${req.params.startId} → ${req.params.endId}`
    );

    const route = await Route.findOne({
      startLocation: req.params.startId,
      endLocation: req.params.endId,
    })
      .populate("startLocation", "name description qrCode category imageUrl")
      .populate("endLocation", "name description qrCode category imageUrl")
      .lean();

    if (!route) {
      console.log("Route not found, checking reverse...");

      // Check reverse route
      const reverseRoute = await Route.findOne({
        startLocation: req.params.endId,
        endLocation: req.params.startId,
      })
        .populate("startLocation", "name description qrCode category imageUrl")
        .populate("endLocation", "name description qrCode category imageUrl")
        .lean();

      if (reverseRoute) {
        // Reverse the steps for return journey
        const reversedSteps = [...reverseRoute.steps]
          .reverse()
          .map((step, index) => ({
            ...step,
            instruction: step.instruction
              .replace(/From/g, "Returning from")
              .replace(/right/g, "left")
              .replace(/left/g, "right"),
          }));

        return res.json({
          ...reverseRoute,
          startLocation: reverseRoute.endLocation, // Swap
          endLocation: reverseRoute.startLocation, // Swap
          steps: reversedSteps,
          isReversed: true,
          originalRouteId: reverseRoute._id,
        });
      }

      return res.status(404).json({
        error: "Route not found",
        message: `No route exists between these locations`,
        availableRoutes: await getAvailableRoutes(),
      });
    }

    // Calculate totals
    const totalDistance = calculateTotalDistance(route.steps);
    const totalTime = calculateTotalTime(route.steps);

    // Enhanced response with all data
    const enhancedRoute = {
      ...route,
      metadata: {
        totalSteps: route.steps.length,
        totalDistance: totalDistance,
        totalTime: totalTime,
        difficulty: calculateDifficulty(route.steps),
        hasStairs: route.steps.some((s) =>
          s.instruction.toLowerCase().includes("stair")
        ),
        hasElevator: route.steps.some((s) =>
          s.instruction.toLowerCase().includes("elevator")
        ),
      },
      steps: route.steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
        // Ensure image URL is complete
        imageUrl: step.imageUrl.startsWith("http")
          ? step.imageUrl
          : step.imageUrl.startsWith("/")
          ? step.imageUrl
          : `/steps/${step.imageUrl}`,
      })),
    };

    console.log(`✅ Returning route with ${route.steps.length} steps`);
    res.json(enhancedRoute);
  } catch (err) {
    console.error("Route fetch error:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Helper functions
function calculateTotalDistance(steps) {
  return steps.reduce((total, step) => {
    const match = step.distance?.match(/(\d+(\.\d+)?)/);
    return total + (match ? parseFloat(match[1]) : 0);
  }, 0);
}

function calculateTotalTime(steps) {
  return steps.reduce((total, step) => {
    if (step.estimatedTime) {
      const minutesMatch = step.estimatedTime.match(/(\d+)\s*min/);
      const secondsMatch = step.estimatedTime.match(/(\d+)\s*sec/);
      const totalMatch = step.estimatedTime.match(/(\d+(\.\d+)?)/);

      let seconds = 0;
      if (minutesMatch) seconds += parseInt(minutesMatch[1]) * 60;
      if (secondsMatch) seconds += parseInt(secondsMatch[1]);
      if (!minutesMatch && !secondsMatch && totalMatch)
        seconds += parseInt(totalMatch[1]);

      return total + seconds;
    }
    return total + 60; // Default 1 minute
  }, 0);
}

function calculateDifficulty(steps) {
  const totalDistance = calculateTotalDistance(steps);
  const totalTime = calculateTotalTime(steps);

  if (totalDistance > 100 || totalTime > 300) return "Moderate";
  if (totalDistance > 50 || totalTime > 180) return "Easy";
  return "Very Easy";
}

async function getAvailableRoutes() {
  const routes = await Route.find()
    .populate("startLocation", "name qrCode")
    .populate("endLocation", "name qrCode")
    .limit(10);

  return routes.map((r) => ({
    from: r.startLocation?.name,
    to: r.endLocation?.name,
    fromQr: r.startLocation?.qrCode,
    toQr: r.endLocation?.qrCode,
    steps: r.steps.length,
  }));
}

module.exports = router;
