import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// 👇 Import your optimized DB connection
import connectDB from "./src/config/db.js";
import "./src/config/passport.js";

import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";

dotenv.config();

// ❌ REMOVED: connectDB();
// We removed the top-level call because we want the middleware below to handle it.

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      const clientUrl = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.replace(/\/$/, "")
        : "";
      const allowedOrigins = ["http://localhost:5173", clientUrl];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

// 👇🔥 THE FIX: Add this middleware BEFORE your routes
// This forces Vercel to wait for the DB connection before running any logic
app.use(async (req, res, next) => {
  try {
    await connectDB(); // Wait for the cached connection
    next();
  } catch (err) {
    console.error("Database connection failed during request:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});
// 👆 END FIX

app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("ProjectUI Backend is running...");
});

app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
