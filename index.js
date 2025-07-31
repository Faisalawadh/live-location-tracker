
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const GOOGLE_SHEETS_WEBHOOK = "https://YOUR_WEBHOOK_URL_HERE"; // Replace with actual n8n webhook

app.post("/telegram", async (req, res) => {
  try {
    const data = req.body;

    if (data.edited_message && data.edited_message.location) {
      const { latitude, longitude } = data.edited_message.location;
      const name = data.edited_message.from.first_name || "غير معروف";
      const username = data.edited_message.from.username || "";
      const timestamp = new Date().toISOString();

      await fetch(GOOGLE_SHEETS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          latitude,
          longitude,
          time: timestamp,
        }),
      });

      console.log("✅ موقع مباشر تم تسجيله:", latitude, longitude);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ خطأ:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Live Location Webhook on port ${PORT}`));
