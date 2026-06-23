import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { getAccessToken } from "./services/momo.js";

const app = express();

app.use(express.json());

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});