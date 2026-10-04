const pool = require("../config/db");

async function findAllByBrand(brandId) {
  const result = await pool.query(
    `
      SELECT
        id,
        brand_id,
        name,
        priority,
        condition,
        action,
        enabled,
        validation_status,
        created_at
      FROM rules
      WHERE brand_id = $1
      ORDER BY priority DESC, id ASC
    `,
    [brandId]
  );

  return result.rows;
}

async function create(rule) {
  const result = await pool.query(
    `
      INSERT INTO rules (
        brand_id,
        name,
        priority,
        condition,
        action,
        enabled
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      rule.brandId,
      rule.name,
      rule.priority,
      JSON.stringify(rule.condition),
      JSON.stringify(rule.action),
      rule.enabled ?? true
    ]
  );

  return result.rows[0];
}

module.exports = {
  findAllByBrand,
  create
};
