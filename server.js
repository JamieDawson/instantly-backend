// server.js (or index.js)
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const BASE_URL = "https://api.instantly.ai/api/v2";
const API_KEY = process.env.INSTANTLY_API_KEY;
const USE_MOCK = process.env.USE_MOCK === "true";

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, useMock: USE_MOCK });
});

// Analytics route
app.get("/api/analytics", async (req, res) => {
  try {
    if (USE_MOCK) {
      // Mock example
      const mockData = {
        campaignName: "Demo Campaign",
        daily: [
          { date: "2025-10-17", sent: 100, opened: 60, replied: 10 },
          { date: "2025-10-18", sent: 120, opened: 70, replied: 12 },
          { date: "2025-10-19", sent: 90, opened: 55, replied: 9 },
        ],
      };
      return res.json(mockData);
    }

    // STEP 1: Get campaigns
    const campaigns = await axios.get(`${BASE_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // STEP 2: Pick the first campaign ID
    const campaignId = campaigns.data[0]?.id;
    if (!campaignId) throw new Error("No campaigns found");

    // STEP 3: Fetch analytics for that campaign
    const analytics = await axios.get(
      `${BASE_URL}/campaigns/${campaignId}/analytics`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    res.json({
      campaignId,
      analytics: analytics.data,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.response?.data || { message: error.message },
    });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
