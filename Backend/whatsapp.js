import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_BASE = process.env.WHATSAPP_BASE_URL;

/**
 * 🔥 SAFE FETCH WITH TIMEOUT
 */
async function safeFetch(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * 🔁 RETRY WRAPPER
 */
async function retry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.log("🔁 Retrying...", retries);
    return retry(fn, retries - 1);
  }
}

/**
 * 🚀 SEND TEMPLATE (CORE FUNCTION)
 */
export async function sendTemplate(to, templateName = "hello_world") {
  try {
    if (!to) throw new Error("Recipient number required");

    const body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
      },
    };

    const response = await retry(() =>
      safeFetch(
        `${WHATSAPP_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      )
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.messages?.[0]?.id) {
      console.error("❌ Template send error:", data);
      throw new Error(data?.error?.message || "Template send failed");
    }

    console.log(`✅ Sent to ${to}`);

    return data.messages[0].id;
  } catch (err) {
    console.error("❌ sendTemplate error:", {
      to,
      error: err.message,
    });
    return null;
  }
}