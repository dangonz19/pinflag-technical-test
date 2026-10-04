const express = require("express");
const simulationController = require(
  "../controllers/simulationController"
);

const router = express.Router();

router.post("/", simulationController.simulateOrder);

module.exports = router;