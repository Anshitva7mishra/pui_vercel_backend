import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import connectDB from "./src/config/db.js";
import "./src/config/passport.js";

import authRoutes from "./src/routes/authRoutes.js";

import { errorHandler } from "./src/middlewares/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

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
