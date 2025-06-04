const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const ambulansRoutes = require("./routes/ambulans");
const reviewRoutes = require("./routes/reviewRoutes");

// Import migrations
const createReviewsTable = require("./migrations/reviews");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Migration endpoint (development only)
app.post("/api/migrate", async (req, res) => {
  try {
    await createReviewsTable();
    res.json({ message: "Migration completed successfully" });
  } catch (err) {
    console.error("Migration failed:", err);
    res.status(500).json({ 
      error: "Migration failed", 
      details: err.message 
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ambulans", ambulansRoutes);
app.use("/api/reviews", reviewRoutes);

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    path: req.path,
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Database Host:", process.env.DB_HOST ? "Configured" : "Missing");
});
