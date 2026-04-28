import express from "express";
import { sendTemplate } from "../whatsapp.js";
import { pool } from "../db.js";
import { requireAuth } from "../Middleware/authrequirements.js";
const router = express.Router();
router.use(requireAuth);
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
 * 🚀 CORE SENDER FUNCTION (DB VERSION)
 */
const runCampaign = async (campaignId, numbers, template) => {
  console.log(`🚀 Running campaign: ${campaignId}`);

  for (const number of numbers) {
    try {
      const messageId = await sendTemplate(number, template);

      // ✅ insert message row
      await pool.query(
        `INSERT INTO campaign_messages 
        (campaign_id, phone_number, message_id, status, sent_at)
        VALUES ($1, $2, $3, $4, NOW())`,
        [campaignId, number, messageId || null, messageId ? "sent" : "failed"],
      );

      // ✅ store tracking
      if (messageId) {
        await pool.query(
          `INSERT INTO message_tracking 
          (message_id, campaign_id, phone_number, status)
          VALUES ($1, $2, $3, $4)`,
          [messageId, campaignId, number, "sent"],
        );
      }
    } catch (err) {
      console.error("Send error:", err.message);

      await pool.query(
        `INSERT INTO campaign_messages 
        (campaign_id, phone_number, status, sent_at)
        VALUES ($1, $2, 'failed', NOW())`,
        [campaignId, number],
      );
    }

    // ⏱ rate limit safety
    await new Promise((r) => setTimeout(r, 200));
  }

  // ✅ mark campaign completed
  await pool.query(`UPDATE campaigns SET status = 'completed' WHERE id = $1`, [
    campaignId,
  ]);

  console.log(`✅ Campaign completed: ${campaignId}`);
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

  try {
    // ✅ create campaign
    const result = await pool.query(
      `INSERT INTO campaigns (name, template, status)
       VALUES ($1, $2, 'running')
       RETURNING id`,
      [name || "Instant Campaign", template],
    );

    const campaignId = result.rows[0].id;

    // 🚀 run async
    runCampaign(campaignId, list, template);

    res.json({
      success: true,
      message: "Campaign started",
      campaignId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ⏰ SCHEDULE CAMPAIGN
 */
router.post("/schedule", async (req, res) => {
  const { numbers, template, name, scheduleAt } = req.body;

  const list = normalizeNumbers(numbers);

  if (!list.length) {
    return res.status(400).json({ error: "No valid numbers" });
  }

  const delay = new Date(scheduleAt) - new Date();

  if (delay <= 0) {
    return res.status(400).json({ error: "Invalid schedule time" });
  }

  try {
    // ✅ create campaign
    const result = await pool.query(
      `INSERT INTO campaigns (name, template, status, scheduled_at)
       VALUES ($1, $2, 'scheduled', $3)
       RETURNING id`,
      [name || "Scheduled Campaign", template, scheduleAt],
    );

    const campaignId = result.rows[0].id;

    setTimeout(() => {
      pool.query(`UPDATE campaigns SET status = 'running' WHERE id = $1`, [
        campaignId,
      ]);

      runCampaign(campaignId, list, template);
    }, delay);

    res.json({
      success: true,
      message: "Campaign scheduled",
      runInMs: delay,
      campaignId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 📊 HISTORY (DB VERSION)
 */
router.get("/history", async (req, res) => {
  try {
    const campaigns = await pool.query(`
      SELECT * FROM campaigns ORDER BY created_at DESC
    `);

    const data = [];

    for (const c of campaigns.rows) {
      const messages = await pool.query(
        `SELECT * FROM campaign_messages WHERE campaign_id = $1`,
        [c.id],
      );

      let sent = 0;
      let delivered = 0;
      let read = 0;
      let replies = 0;

      for (const m of messages.rows) {
        // ✅ sent
        if (m.sent_at) sent++;

        // ✅ delivered (delivered OR read)
        if (m.delivered_at || m.read_at) delivered++;

        // ✅ read
        if (m.read_at) read++;

        // ✅ replies
        if (m.reply_count > 0) replies++;
      }

      const deliveryRate = sent ? ((delivered / sent) * 100).toFixed(1) : "0";

      const readRate = sent ? ((read / sent) * 100).toFixed(1) : "0";

      // ✅ new flags (VERY useful for UI)
      const allDelivered = sent > 0 && delivered === sent;
      const allRead = sent > 0 && read === sent;

      data.push({
        id: c.id,
        name: c.name,
        template: c.template,
        createdAt: c.created_at,
        status: c.status,

        stats: {
          sent,
          delivered,
          read,
          replies,
          deliveryRate,
          readRate,
          allDelivered,
          allRead,
        },

        results: messages.rows,
      });
    }

    res.json({
      total: data.length,
      campaigns: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🔍 SINGLE CAMPAIGN
 */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const campaign = await pool.query(`SELECT * FROM campaigns WHERE id = $1`, [
      id,
    ]);

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const messages = await pool.query(
      `SELECT * FROM campaign_messages WHERE campaign_id = $1`,
      [id],
    );

    res.json({
      ...campaign.rows[0],
      results: messages.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
