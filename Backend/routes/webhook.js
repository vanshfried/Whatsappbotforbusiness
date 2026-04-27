import express from "express";

const router = express.Router();

// 🔐 VERIFY WEBHOOK (Meta requirement)
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
router.post("/", (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    /**
     * 📊 STATUS UPDATES (sent/delivered/read)
     */
    const statuses = value?.statuses;

    if (statuses) {
      for (const status of statuses) {
        const messageId = status.id;
        const statusValue = status.status;

        console.log(`📊 ${messageId} → ${statusValue}`);

        if (global.messageStore?.[messageId]) {
          const msg = global.messageStore[messageId];
          msg.status = statusValue;

          // 🔍 find campaign
          const campaign = global.campaigns?.find(
            (c) => c.id === msg.campaignId
          );
          if (!campaign) continue;

          const result = campaign.results.find(
            (r) => r.messageId === messageId
          );
          if (!result) continue;

          // ⏱ timestamps
          if (statusValue === "delivered" && !result.deliveredAt) {
            result.deliveredAt = new Date();
          }

          if (statusValue === "read" && !result.readAt) {
            result.readAt = new Date();
          }
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

        const campaignId = global.numberToCampaign?.[from];
        if (!campaignId) continue;

        const campaign = global.campaigns?.find(
          (c) => c.id === campaignId
        );
        if (!campaign) continue;

        const result = campaign.results.find(
          (r) => r.number === from
        );
        if (!result) continue;

        // 🔢 increase reply count
        result.replyCount = (result.replyCount || 0) + 1;

        // 🥇 store ONLY first reply
        if (!result.firstReply) {
          result.firstReply = {
            text,
            time: new Date(),
          };
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