const ruleRepository = require("../repositories/ruleRepository");
const simulationRepository = require("../repositories/simulationRepository");

const {
  evaluateRules,
  resolveRules,
  buildResult,
  buildTrace
} = require("../services/ruleEngine");

async function simulateOrder(req, res) {
  try {
    const order = req.body;

    const rules = await ruleRepository.findAllByBrand(
      order.brandId
    );

    const matchedRules = evaluateRules(order, rules);

    const winningRules = resolveRules(matchedRules);

    const result = buildResult(winningRules);

    const trace = buildTrace(
      matchedRules,
      winningRules
    );

    const simulation =
      await simulationRepository.createSimulation(order);

    await simulationRepository.createDecisionLog(
      simulation.id,
      order,
      trace,
      result
    );

    res.status(201).json({
      simulationId: simulation.id,
      result,
      matchedRules: trace
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to simulate order"
    });
  }
}

module.exports = {
  simulateOrder
};