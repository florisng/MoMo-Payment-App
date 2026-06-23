import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { getAccessToken } from "./services/momo.js";
import payRoutes from "./routes/pay.js";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/env-check", (req, res) => {
  res.json({
    hasSubscriptionKey: !!process.env.MOMO_SUBSCRIPTION_KEY,
    hasApiUser: !!process.env.MOMO_API_USER,
    hasApiKey: !!process.env.MOMO_API_KEY,
    baseUrl: process.env.MOMO_BASE_URL,
  });
});

app.get("/token-test", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ token });
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to get token",
      details: err.response?.data || err.message,
    });
  }
});

app.use("/api", payRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});