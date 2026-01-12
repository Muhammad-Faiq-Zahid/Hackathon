const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// Get location by QR code
router.get("/qr/:qrCode", async (req, res) => {
  try {
    const qrCode = req.params.qrCode;

    // Map LOBBY-001 to ENTRANCE-001 for compatibility
    const qrCodeMap = {
      "LOBBY-001": "ENTRANCE-001",
      "ENTRANCE-001": "ENTRANCE-001",
      "TAKH-101": "TAKH-101",
      "CAFE-102": "CAFE-102",
    };

    const actualQrCode = qrCodeMap[qrCode] || qrCode;

    const locations = {
      "ENTRANCE-001": {
        /* your location data */
      },
      "TAKH-101": {
        /* your location data */
      },
      "CAFE-102": {
        /* your location data */
      },
    };

    const location = await Location.findOne({
      qrCode: req.params.qrCode,
    }).populate("destinations", "name qrCode");

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all locations (for admin)
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
