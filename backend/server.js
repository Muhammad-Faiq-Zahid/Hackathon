const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const locationRoutes = require("./routes/locations");
const routeRoutes = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 3200;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Your React frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart_visitor")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/locations", locationRoutes);
app.use("/api/routes", routeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
