import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./LoginAuth/Login.js"; // your login file
import { pool } from "./db.js";
import createUserRoutes from "./routes/admin/createUser.js";
import sendBulkRoutes from "./routes/bulk.js";
import webhookRoutes from "./routes/webhook.js";
dotenv.config();

const app = express();

// 🌐 Middleware
app.use(express.json());
app.use(cookieParser());

// 🔐 CORS (VERY IMPORTANT for cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Vite frontend
    credentials: true,
  })
);

// 📌 Routes
app.use("/auth", authRoutes);
app.use("/createuser", createUserRoutes);
app.use("/bulk", sendBulkRoutes);
app.use("/webhook", webhookRoutes);
// 🧪 Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// 🚀 Start server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});