const ruleRepository = require("../repositories/ruleRepository");
const {
  validateRule
} = require("../validators/ruleValidator");

async function getRules(req, res) {
  try {
    const brandId = Number(req.query.brandId || 1);

    const rules = await ruleRepository.findAllByBrand(brandId);

    res.json({
      data: rules
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve rules"
    });
  }
}

async function createRule(req, res) {
  try {
    const rule = req.body;

    const validation = validateRule(rule);

    if (!validation.valid) {
      return res.status(422).json({
        error: "Invalid rule",
        details: validation.errors
      });
    }

    const createdRule =
      await ruleRepository.create(rule);

    res.status(201).json({
      data: createdRule
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create rule"
    });
  }
}

module.exports = {
  getRules,
  createRule
};