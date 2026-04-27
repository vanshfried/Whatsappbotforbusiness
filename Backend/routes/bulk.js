import express from "express";
import { sendTemplate } from "../whatsapp.js";

const router = express.Router();

/**
 * 🧠 TEMP STORAGE (no DB)
 */
const campaigns = [];

/**
 * 🌍 GLOBAL stores
 */
global.messageStore = global.messageStore || {};
global.numberToCampaign = global.numberToCampaign || {};

/**
 * 🔢 Normalize numbers
 */
const normalizeNumbers = (input) => {
  if (!input) return [];

  return input
    .split(/[\n, ,]+/)
    .map((n) => n.replace(/\D/g, ""))
    .filter((n) => n.length >= 10);
};

/**
 * 🚀 CORE SENDER FUNCTION
 */
const runCampaign = async (campaign) => {
  console.log(`🚀 Running campaign: ${campaign.name}`);

  for (const number of campaign.numbers) {
    try {
      const messageId = await sendTemplate(number, campaign.template);

      const result = {
        number,
        status: messageId ? "sent" : "failed",
        messageId: messageId || null,

        // 📊 tracking fields
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null,

        firstReply: null,
        replyCount: 0,
      };

      campaign.results.push(result);

      // ✅ store messageId for webhook tracking
      if (messageId) {
        global.messageStore[messageId] = {
          number,
          campaignId: campaign.id,
          status: "sent",
        };

        // 🔁 reverse mapping (for replies)
        global.numberToCampaign[number] = campaign.id;
      }
    } catch (err) {
      campaign.results.push({
        number,
        status: "failed",
        error: err.message,
        sentAt: new Date(),
      });
    }

    // 🔥 delay (Meta rate limit safety)
    await new Promise((r) => setTimeout(r, 200));
  }

  campaign.status = "completed";
  console.log(`✅ Campaign completed: ${campaign.name}`);
};

/**
 * 📤 SEND NOW
 */
router.post("/send", async (req, res) => {
  const { numbers, template, name } = req.body;

  const list = normalizeNumbers(numbers);

  if (!list.length) {
    return res.status(400).json({ error: "No valid numbers" });
  }

  const campaign = {
    id: Date.now(),
    name: name || "Instant Campaign",
    template,
    numbers: list,
    status: "running",
    results: [],
    createdAt: new Date(),
  };

  campaigns.push(campaign);

  // 🚀 async run
  runCampaign(campaign);

  res.json({
    success: true,
    message: "Campaign started",
    campaignId: campaign.id,
  });
});

/**
 * ⏰ SCHEDULE CAMPAIGN
 */
router.post("/schedule", (req, res) => {
  const { numbers, template, name, scheduleAt } = req.body;

  const list = normalizeNumbers(numbers);

  if (!list.length) {
    return res.status(400).json({ error: "No valid numbers" });
  }

  const delay = new Date(scheduleAt) - new Date();

  if (delay <= 0) {
    return res.status(400).json({ error: "Invalid schedule time" });
  }

  const campaign = {
    id: Date.now(),
    name: name || "Scheduled Campaign",
    template,
    numbers: list,
    status: "scheduled",
    results: [],
    createdAt: new Date(),
    scheduleAt,
  };

  campaigns.push(campaign);

  setTimeout(() => {
    campaign.status = "running";
    runCampaign(campaign);
  }, delay);

  res.json({
    success: true,
    message: "Campaign scheduled",
    runInMs: delay,
    campaignId: campaign.id,
  });
});

/**
 * 📊 HISTORY (ENRICHED + STATS)
 */
router.get("/history", (req, res) => {
  const enrichedCampaigns = campaigns.map((campaign) => {
    let sent = campaign.results.length;
    let delivered = 0;
    let read = 0;
    let replies = 0;

    const updatedResults = campaign.results.map((r) => {
      if (r.messageId && global.messageStore[r.messageId]) {
        r.liveStatus = global.messageStore[r.messageId].status;
      }

      if (r.liveStatus === "delivered") delivered++;
      if (r.liveStatus === "read") read++;
      if (r.replyCount > 0) replies++;

      return r;
    });

    return {
      id: campaign.id,
      name: campaign.name,
      template: campaign.template,
      createdAt: campaign.createdAt,
      status: campaign.status,

      stats: {
        sent,
        delivered,
        read,
        replies,
        deliveryRate: sent ? ((delivered / sent) * 100).toFixed(1) : "0",
        readRate: sent ? ((read / sent) * 100).toFixed(1) : "0",
      },

      results: updatedResults,
    };
  });

  res.json({
    total: campaigns.length,
    campaigns: enrichedCampaigns,
  });
});

/**
 * 🔍 SINGLE CAMPAIGN (for detail page)
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return res.status(404).json({ error: "Campaign not found" });
  }

  res.json(campaign);
});

export default router;
