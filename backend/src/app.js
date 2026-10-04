const express = require("express");
const cors = require("cors");
const ruleRoutes = require("./routes/ruleRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/simulations", simulationRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Pinflag Shipping Rules API",
    status: "running",
    endpoints: {
      health: "/api/health",
      rules: "/api/rules"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Pinflag Shipping Rules API"
  });
});

app.use("/api/rules", ruleRoutes);

module.exports = app;