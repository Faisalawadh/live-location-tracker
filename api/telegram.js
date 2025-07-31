
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// تخزين المواقع مؤقتًا داخل الذاكرة
let locations = [];

// مسار استقبال الموقع من Telegram
app.post("/telegram", async (req, res) => {
  try {
    const data = req.body;

    if (data.edited_message && data.edited_message.location) {
      const { latitude, longitude } = data.edited_message.location;
      const name = data.edited_message.from.first_name || "غير معروف";
      const username = data.edited_message.from.username || "";
      const timestamp = new Date().toISOString();

      // حفظ الموقع في المصفوفة
      locations.push({ name, username, latitude, longitude, time: timestamp });
      console.log("✅ تم استقبال موقع مباشر:", latitude, longitude);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ خطأ:", err);
    res.sendStatus(500);
  }
});

// API لإرجاع جميع المواقع
app.get("/data", (req, res) => {
  res.json(locations);
});

// واجهة عرض الخريطة (صفحة بسيطة)
app.get("/dashboard", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>خريطة السائقين</title>
    <meta charset="utf-8">
    <style> html, body, #map { height: 100%; margin: 0; padding: 0; } </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      let map;
      async function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 10,
          center: { lat: 29.3759, lng: 47.9774 }
        });
        fetchData();
        setInterval(fetchData, 30000);
      }

      async function fetchData() {
        try {
          const res = await fetch("/data");
          const locations = await res.json();
          map.markers?.forEach(m => m.setMap(null));
          map.markers = locations.map(l => {
            const marker = new google.maps.Marker({
              position: { lat: l.latitude, lng: l.longitude },
              map: map,
              title: l.name
            });
            const infowindow = new google.maps.InfoWindow({
              content: `<b>${l.name}</b><br>@${l.username}<br>${l.time}`
            });
            marker.addListener("click", () => infowindow.open(map, marker));
            return marker;
          });
        } catch (err) {
          console.error("حدث خطأ في تحميل البيانات:", err);
        }
      }
    </script>
    <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBezv5ZQM1osMg7n5VESeOCE7WxkWHIewc&callback=initMap"></script>
  </body>
  </html>
  `);
});

app.listen(PORT, () => console.log(`🚀 Live Location Server running on port ${PORT}`));
