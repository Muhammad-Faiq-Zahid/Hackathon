require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("./models/Location");
const Route = require("./models/Route");

const sampleData = async () => {
  try {
    // 1. CONNECT TO DATABASE
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/smart_visitor",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("✅ MongoDB connected");

    // 2. CLEAR EXISTING DATA (Optional - remove for production)
    console.log("🗑️  Clearing existing data...");
    await Location.deleteMany({});
    await Route.deleteMany({});
    console.log("✅ Old data cleared");

    // 3. CREATE LOCATIONS
    console.log("📍 Creating locations...");

    const locations = {
      entrance: await Location.create({
        qrCode: "ENTRANCE-001",
        name: "Main Entrance",
        description: "Primary building entrance with information desk",
        category: "entrance",
        imageUrl: "/locations/entrance.jpg",
      }),

      takhleeq: await Location.create({
        qrCode: "TAKH-101",
        name: "Takhleeq Office",
        description: "Entrepreneurship and innovation center",
        category: "office",
        imageUrl: "/locations/takhleeq.jpg",
      }),

      cafeteria: await Location.create({
        qrCode: "CAFE-102",
        name: "Student Cafeteria",
        description: "Main dining area with multiple food stations",
        category: "cafeteria",
        imageUrl: "/locations/cafeteria.jpg",
      }),
    };

    console.log(`✅ Created ${Object.keys(locations).length} locations`);

    // 4. LINK DESTINATIONS (Which locations connect to which)
    console.log("🔗 Linking destinations...");

    // From Entrance you can go to all these places
    locations.entrance.destinations = [
      locations.takhleeq._id,

      locations.cafeteria._id,
    ];
    await locations.entrance.save();

    // From Takhleeq you can go back to lobby and to library
    locations.takhleeq.destinations = [
      locations.entrance._id,
      locations.cafeteria._id,
    ];
    await locations.takhleeq.save();

    // Link other locations similarly
    locations.cafeteria.destinations = [
      locations.entrance._id,
      locations.takhleeq._id,
    ];

    await Promise.all([
      locations.entrance.save(),
      locations.cafeteria.save(),
      locations.takhleeq.save(),
    ]);

    console.log("✅ Destinations linked");

    // 5. CREATE NAVIGATION ROUTES
    console.log("🧭 Creating navigation routes...");

    const routes = [
      // Lobby → Takhleeq Office
      {
        startLocation: locations.entrance._id,
        endLocation: locations.takhleeq._id,
        steps: [
          {
            imageUrl: "/steps/lobby-takh-1.jpg",
            instruction: "From the main entrance, go straight",
            distance: "20 meters",
            estimatedTime: "30 seconds",
          },
          {
            imageUrl: "/steps/lobby-takh-2.jpg",
            instruction:
              "Take left towards the cafeteria corridor and go straight",
            distance: "5 meters",
            estimatedTime: " 10 seconds",
          },
          {
            imageUrl: "/steps/lobby-takh-3.jpg",
            instruction: "Take right at the junction and go straight",
            distance: "3 meters",
            estimatedTime: "5 seconds",
          },
          {
            imageUrl: "/steps/lobby-takh-4.jpg",
            instruction:
              "Go straight until you see the end of pathway, Takhleeq Office is on your left",
            distance: "12 meters",
            estimatedTime: "15 seconds",
          },
          {
            imageUrl: "/steps/lobby-takh-5.jpg",
            instruction:
              "Take left at the junction, go straight and Takhleeq Office will be right in front of you",
            distance: "3 meters",
            estimatedTime: "5 seconds",
          },
        ],
      },

      // Lobby → Library

      // Lobby → Cafeteria
      {
        startLocation: locations.entrance._id,
        endLocation: locations.cafeteria._id,
        steps: [
          {
            imageUrl: "/steps/lobby-cafe-1.jpg",
            instruction: "From lobby, take the corridor on your left",
            distance: "15 meters",
            estimatedTime: "45 seconds",
          },
          {
            imageUrl: "/steps/lobby-cafe-2.jpg",
            instruction: "Continue straight until you smell food",
            distance: "25 meters",
            estimatedTime: "1 minute 15 seconds",
          },
        ],
      },
    ];

    // Insert all routes into database
    await Route.insertMany(routes);
    console.log(`✅ Created ${routes.length} navigation routes`);

    // 6. VERIFY THE DATA
    console.log("\n📊 VERIFICATION REPORT:");
    console.log("=".repeat(40));

    const allLocations = await Location.find().populate(
      "destinations",
      "name qrCode"
    );
    console.log(`Total Locations: ${allLocations.length}`);

    allLocations.forEach((loc) => {
      console.log(`\n📍 ${loc.name} (${loc.qrCode})`);
      console.log(
        `   Destinations: ${loc.destinations.map((d) => d.name).join(", ")}`
      );
    });

    const allRoutes = await Route.find().populate("startLocation endLocation");
    console.log(`\nTotal Routes: ${allRoutes.length}`);
    allRoutes.forEach((route) => {
      console.log(
        `\n🧭 ${route.startLocation.name} → ${route.endLocation.name}`
      );
      console.log(`   Steps: ${route.steps.length}`);
    });

    console.log("\n🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("\nYour database now contains:");
    console.log(`• ${allLocations.length} locations`);
    console.log(`• ${allRoutes.length} navigation routes`);
    console.log("\n🌐 API Endpoints:");
    console.log(`• GET /api/locations/qr/LOBBY-001`);
    console.log(
      `• GET /api/route/${locations.entrance._id}/${locations.takhleeq._id}`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run the seeder
sampleData();
