
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "running",
    project: "Bungoma Agricultural Extension Communication Management System",
    sms: "Sandbox setup in progress"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SMS backend running on port ${PORT}`);
});
