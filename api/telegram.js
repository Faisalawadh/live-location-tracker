let locations = [];

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const data = req.body;
      if (data.edited_message && data.edited_message.location) {
        const { latitude, longitude } = data.edited_message.location;
        const name = data.edited_message.from.first_name || "غير معروف";
        const username = data.edited_message.from.username || "";
        const timestamp = new Date().toISOString();
        locations.push({ name, username, latitude, longitude, time: timestamp });
        console.log("✅ استلم موقع:", latitude, longitude);
      }
      res.status(200).end();
    } catch (err) {
      console.error("❌ خطأ:", err);
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}

export { locations };