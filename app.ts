import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { sequelize } from "./src/connection/connection";
import cors from "cors";
import { router } from "./src/routes/router";
import { announcementRouter } from "./src/routes/announcement";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

const app = express();
const port: number = parseInt(process.env.PORT || "5000");

console.log("me")
console.log("📌 Current working directory:", process.cwd());


// 🔧 Ensure uploads directory exists
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 'uploads/' directory created.");
} else {
  console.log("📁 'uploads/' directory already exists.");
}

// 🔓 CORS setup
const allowedOrigins = ["http://localhost:5173", "https://bitcoinwala.ai","https://bitcoinwala2025.netlify.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 🧠 Body parsers
app.use(bodyParser.json());
app.use(express.json());

// 🖼️ Serve uploaded files statically
app.use("/uploads", express.static(uploadsPath));

// 📦 API routes
app.use("/", router);
app.use("/announcement", announcementRouter);

// 🔁 Health check route
app.get("/", async (_req, res) => {
  res.status(200).send({ message: "pong" });
});

// 🚀 Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // or { force: false } if preferred
    console.log("✅ Database connected.");
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err: any) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

startServer();
