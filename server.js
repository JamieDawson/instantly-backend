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

// Realistic mock data with 2 campaigns
const mockData = [
  {
    campaign_name: "Outreach to SaaS Founders",
    campaign_id: "1a7ccc05-6301-4b24-bede-03363c17c771",
    campaign_status: 1,
    campaign_is_evergreen: false,
    overview: {
      open_count: 800,
      open_count_unique: 700,
      link_click_count: 200,
      reply_count: 150,
      bounced_count: 20,
      unsubscribed_count: 5,
      completed_count: 1100,
      emails_sent_count: 5000,
      new_leads_contacted_count: 300,
      total_opportunities: 12,
      total_opportunity_value: 3500,
      total_interested: 80,
      total_meeting_booked: 40,
      total_meeting_completed: 10,
      total_closed: 5,
    },
    daily: [
      {
        date: "2025-10-17",
        sent: 500,
        opened: 200,
        unique_opened: 180,
        replies: 40,
        unique_replies: 35,
        clicks: 60,
        unique_clicks: 55,
        opportunities: 2,
        unique_opportunities: 1,
      },
      {
        date: "2025-10-18",
        sent: 600,
        opened: 250,
        unique_opened: 220,
        replies: 50,
        unique_replies: 45,
        clicks: 70,
        unique_clicks: 65,
        opportunities: 3,
        unique_opportunities: 2,
      },
    ],
  },
  {
    campaign_name: "Outbound Marketing Test",
    campaign_id: "2b8ddd16-7422-5e35-cede-04477d28d882",
    campaign_status: 1,
    campaign_is_evergreen: true,
    overview: {
      open_count: 400,
      open_count_unique: 380,
      link_click_count: 150,
      reply_count: 70,
      bounced_count: 10,
      unsubscribed_count: 3,
      completed_count: 600,
      emails_sent_count: 2500,
      new_leads_contacted_count: 120,
      total_opportunities: 6,
      total_opportunity_value: 1800,
      total_interested: 40,
      total_meeting_booked: 20,
      total_meeting_completed: 5,
      total_closed: 2,
    },
    daily: [
      {
        date: "2025-10-17",
        sent: 300,
        opened: 120,
        unique_opened: 110,
        replies: 25,
        unique_replies: 20,
        clicks: 35,
        unique_clicks: 30,
        opportunities: 1,
        unique_opportunities: 1,
      },
      {
        date: "2025-10-18",
        sent: 400,
        opened: 150,
        unique_opened: 140,
        replies: 30,
        unique_replies: 28,
        clicks: 40,
        unique_clicks: 38,
        opportunities: 2,
        unique_opportunities: 1,
      },
    ],
  },
];

// Health check. Tells if you the server is running and if you're using mock data
app.get("/api/health", (req, res) => {
  res.json({ ok: true, useMock: USE_MOCK });
});

// Analytics route
app.get("/api/analytics", async (req, res) => {
  try {
    if (USE_MOCK) return res.json(mockData);

    // 1) Fetch campaigns
    const campaignsRes = await axios.get(`${BASE_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      params: { limit: 2 }, // pull first 2 campaigns
    });

    const campaigns = campaignsRes.data.items;
    if (!campaigns || campaigns.length === 0)
      throw new Error("No campaigns found");

    // 2️) For each campaign, fetch daily analytics AND overview
    const analyticsPromises = campaigns.map(async (campaign) => {
      // Daily analytics
      const dailyRes = await axios.get(
        `${BASE_URL}/campaigns/analytics/daily`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          params: {
            campaign_id: campaign.id,
            campaign_status: campaign.status,
            start_date: "2025-10-01",
            end_date: "2025-10-25",
          },
        }
      );

      // Overview analytics
      const overviewRes = await axios.get(
        `${BASE_URL}/campaigns/analytics/overview`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          params: {
            id: campaign.id,
            campaign_status: campaign.status,
            start_date: "2025-10-01",
            end_date: "2025-10-25",
            expand_crm_events: true,
          },
        }
      );

      return {
        campaign_name: campaign.name,
        campaign_id: campaign.id,
        campaign_status: campaign.status,
        campaign_is_evergreen: campaign.is_evergreen,
        overview: overviewRes.data,
        daily: dailyRes.data,
      };
    });

    const result = await Promise.all(analyticsPromises);
    res.json(result);
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
