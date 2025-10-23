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

// Realistic mock data
const mockData = [
  {
    campaign_name: "Demo Campaign A",
    campaign_id: "demo-001",
    campaign_status: 1,
    campaign_is_evergreen: true,
    daily: [
      {
        date: "2025-10-20",
        emails_sent: 100,
        leads_count: 120,
        contacted_count: 110,
        open_count: 60,
        reply_count: 12,
        link_click_count: 25,
        bounced_count: 5,
        unsubscribed_count: 1,
      },
      {
        date: "2025-10-21",
        emails_sent: 120,
        leads_count: 130,
        contacted_count: 115,
        open_count: 70,
        reply_count: 15,
        link_click_count: 30,
        bounced_count: 5,
        unsubscribed_count: 2,
      },
      {
        date: "2025-10-22",
        emails_sent: 90,
        leads_count: 100,
        contacted_count: 95,
        open_count: 50,
        reply_count: 10,
        link_click_count: 20,
        bounced_count: 2,
        unsubscribed_count: 1,
      },
    ],
  },
  {
    campaign_name: "Demo Campaign B",
    campaign_id: "demo-002",
    campaign_status: 1,
    campaign_is_evergreen: false,
    daily: [
      {
        date: "2025-10-20",
        emails_sent: 80,
        leads_count: 100,
        contacted_count: 90,
        open_count: 45,
        reply_count: 8,
        link_click_count: 15,
        bounced_count: 3,
        unsubscribed_count: 0,
      },
      {
        date: "2025-10-21",
        emails_sent: 95,
        leads_count: 110,
        contacted_count: 100,
        open_count: 55,
        reply_count: 10,
        link_click_count: 18,
        bounced_count: 4,
        unsubscribed_count: 1,
      },
      {
        date: "2025-10-22",
        emails_sent: 105,
        leads_count: 120,
        contacted_count: 110,
        open_count: 60,
        reply_count: 12,
        link_click_count: 22,
        bounced_count: 5,
        unsubscribed_count: 0,
      },
    ],
  },
];

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, useMock: USE_MOCK });
});

// Analytics route
app.get("/api/analytics", async (req, res) => {
  try {
    if (USE_MOCK) {
      return res.json(mockData);
    }

    // STEP 1: Get campaigns
    const campaigns = await axios.get(`${BASE_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // STEP 2: Pick the first campaign ID
    const campaignId = campaigns.data.items?.[0]?.id;
    if (!campaignId) throw new Error("No campaigns found");

    console.log("✅ Found campaign ID:", campaignId);

    // STEP 3: Fetch daily analytics for that campaign
    const analytics = await axios.get(
      `${BASE_URL}/analytics/campaigns/${campaignId}/daily`,
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

// Run with: node server.js
