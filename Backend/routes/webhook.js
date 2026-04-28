import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🔐 VERIFY WEBHOOK
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// 📩 RECEIVE EVENTS
router.post("/", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    /**
     * 📊 STATUS UPDATES
     */
    const statuses = value?.statuses;

    if (statuses) {
      for (const status of statuses) {
        const messageId = status.id;
        const statusValue = status.status;

        console.log(`📊 ${messageId} → ${statusValue}`);

        // ✅ update tracking table
        await pool.query(
          `UPDATE message_tracking 
           SET status = $1 
           WHERE message_id = $2`,
          [statusValue, messageId]
        );

        // ✅ update campaign_messages
        if (statusValue === "delivered") {
          await pool.query(
            `UPDATE campaign_messages
             SET status = 'delivered',
                 delivered_at = NOW()
             WHERE message_id = $1`,
            [messageId]
          );
        }

        if (statusValue === "read") {
          await pool.query(
            `UPDATE campaign_messages
             SET status = 'read',
                 read_at = NOW()
             WHERE message_id = $1`,
            [messageId]
          );
        }
      }
    }

    /**
     * 💬 REPLY TRACKING
     */
    const messages = value?.messages;

    if (messages) {
      for (const msg of messages) {
        const from = msg.from;
        const text = msg.text?.body || "";

        console.log(`💬 Reply from ${from}: ${text}`);

        // 🔍 find latest campaign message for this number
        const result = await pool.query(
          `SELECT * FROM campaign_messages
           WHERE phone_number = $1
           ORDER BY sent_at DESC
           LIMIT 1`,
          [from]
        );

        if (result.rows.length === 0) continue;

        const message = result.rows[0];

        // 🔢 increase reply count
        await pool.query(
          `UPDATE campaign_messages
           SET reply_count = reply_count + 1
           WHERE id = $1`,
          [message.id]
        );

        // 🥇 store ONLY first reply
        if (!message.first_reply_text) {
          await pool.query(
            `UPDATE campaign_messages
             SET first_reply_text = $1,
                 first_reply_time = NOW()
             WHERE id = $2`,
            [text, message.id]
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
});

export default router;