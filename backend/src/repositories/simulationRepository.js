const pool = require("../config/db");

async function createSimulation(order) {
  const result = await pool.query(
    `
      INSERT INTO simulations (
        brand_id,
        amount,
        weight,
        commune,
        delivery_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      order.brandId,
      order.amount,
      order.weight,
      order.commune,
      order.deliveryType
    ]
  );

  return result.rows[0];
}

async function createDecisionLog(
  simulationId,
  input,
  matchedRules,
  result
) {
  const queryResult = await pool.query(
    `
      INSERT INTO decision_logs (
        simulation_id,
        input_snapshot,
        matched_rules_snapshot,
        result_snapshot
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      simulationId,
      input,
      JSON.stringify(matchedRules),
      JSON.stringify(result)
    ]
  );

  return queryResult.rows[0];
}

module.exports = {
  createSimulation,
  createDecisionLog
};