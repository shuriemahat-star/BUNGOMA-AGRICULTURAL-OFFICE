
const express = require("express");
const AfricasTalking = require("africastalking");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// Allow requests from the Bungoma GitHub Pages website
const allowedOrigin =
  "https://shuriemahat-star.github.io";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Connect to Supabase using the private server key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Check that the user is signed in and is authorised staff
async function requireStaff(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        error: "Please sign in first."
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Your login session is invalid or expired."
      });
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (
      profileError ||
      !profile ||
      !["officer", "management"].includes(profile.role)
    ) {
      return res.status(403).json({
        error: "Only authorised staff can send SMS."
      });
    }

    req.user = data.user;
    next();
  } catch (error) {
    console.error("Staff verification failed:", error.message);
    return res.status(500).json({
      error: "Could not verify staff access."
    });
  }
}

// Backend health check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    project: "Bungoma Agricultural Extension Communication Management System",
    database: "Supabase configured",
    sms: "Staff authentication required"
  });
});

// Send one SMS after verifying staff access
app.post("/send-sms", requireStaff, async (req, res) => {
  try {
    const { to, message, announcement_id, farmer_id } = req.body;

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
        error: "Africa's Talking settings are missing."
      });
    }

    const at = AfricasTalking({ apiKey, username });

    const result = await at.SMS.send({
      to: [to],
      message: message.trim()
    });

    const providerMessage =
      result?.SMSMessageData?.Recipients?.[0];

    const providerStatus = providerMessage?.status || "Pending";
    const providerId = providerMessage?.messageId || null;

    const { error: logError } = await supabase
      .from("sms_logs")
      .insert({
        announcement_id: announcement_id || null,
        farmer_id: farmer_id || null,
        phone: to,
        status: providerStatus,
        provider_message_id: providerId
      });

    if (logError) {
      console.error("SMS log save failed:", logError.message);
    }

    return res.json({
      success: true,
      message: "SMS request submitted to Africa's Talking.",
      status: providerStatus
    });
  } catch (error) {
    console.error("SMS sending failed:", error.message);

    return res.status(500).json({
      error: "SMS request failed. Check the backend logs."
    });
  }
});
// Create a farmer login account
app.post("/create-farmer-account", requireStaff, async (req, res) => {
  try {
    const { full_name, email, password, phone, ward } = req.body;

    // Validate farmer details
    if (
      !full_name ||
      !email ||
      !password ||
      !phone ||
      !ward
    ) {
      return res.status(400).json({
        error: "All farmer details are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters."
      });
    }

    // Create farmer authentication account
    const { data, error } =
      await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          role: "farmer"
        }
      });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    // Save farmer role in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        role: "farmer"
      });

    if (profileError) {
      // Remove the authentication account if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);

      console.error("Profile creation failed:", profileError.message);

      return res.status(500).json({
        error: "Farmer account could not be saved."
      });
    }

    return res.status(201).json({
      success: true,
      message: "Farmer account created successfully.",
      farmer: {
        id: data.user.id,
        email: data.user.email,
        full_name: full_name
      }
    });

  } catch (error) {
    console.error("Farmer registration failed:", error.message);

    return res.status(500).json({
      error: "Could not create farmer account."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bungoma backend running on port ${PORT}`);
});
