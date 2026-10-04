const express = require("express");
const ruleController = require("../controllers/ruleController");

const router = express.Router();

router.get("/", ruleController.getRules);
router.post("/", ruleController.createRule);

module.exports = router;