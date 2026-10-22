const express = require("express");
const AfricasTalking = require("africastalking");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// Allow requests from your GitHub Pages website
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://shuriemahat-star.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (req, res) => {
  res.json({
    status: "running",
    project: "Bungoma Agricultural Extension Communication Management System",
    sms: "Sandbox SMS endpoint ready"
  });
});

// Send an SMS through Africa's Talking Sandbox
app.post("/send-sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (
      typeof to !== "string" ||
      !/^\+254[17]\d{8}$/.test(to) ||
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 480
    ) {
      return res.status(400).json({
        error: "Enter a valid Kenyan number (+254...) and a message up to 480 characters."
      });
    }

    const apiKey = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME;

    if (!apiKey || !username) {
      return res.status(500).json({
        error: "Africa's Talking credentials are missing from server settings."
      });
    }

    const at = AfricasTalking({ apiKey, username });
    const sms = at.SMS;

    const result = await sms.send({
      to: [to],
      message: message.trim()
    });

    return res.json({
      success: true,
      message: "SMS request submitted to Africa's Talking Sandbox.",
      result
    });
  } catch (error) {
    console.error("SMS sending failed:", error.message);

    return res.status(500).json({
      error: "SMS request failed. Check the backend logs and Sandbox settings."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SMS backend running on port ${PORT}`);
});
