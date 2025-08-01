import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import surveyRoutes from "./routes/survey.routes.js";
import matchRoutes from "./routes/match.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import finalmatchRoutes from './routes/finalmatch.route.js';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/finalmatch", finalmatchRoutes);

app.use("/api/connection-requests", connectionRoutes);



// -------- Centralized Error Handling Middleware --------
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});
// -------------------------------------------------------

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected.");
    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running on port " + (process.env.PORT || 5000));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
