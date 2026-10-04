const allowedFields = [
  "amount",
  "weight",
  "commune",
  "deliveryType"
];

const allowedOperators = [
  ">",
  ">=",
  "<",
  "<=",
  "=",
  "!="
];

const allowedActionTypes = [
  "ASSIGN_COURIER",
  "SET_SHIPPING_PRICE",
  "SET_DELIVERY_TYPE_AVAILABILITY"
];

function validateRule(rule) {
  const errors = [];

  if (!rule.name || !rule.name.trim()) {
    errors.push("Rule name is required");
  }

  if (!Number.isInteger(rule.priority)) {
    errors.push("Priority must be an integer");
  }

  if (!rule.condition) {
    errors.push("Condition is required");
  } else {
    if (!allowedFields.includes(rule.condition.field)) {
      errors.push("Invalid condition field");
    }

    if (!allowedOperators.includes(rule.condition.operator)) {
      errors.push("Invalid condition operator");
    }

    if (rule.condition.value === undefined) {
      errors.push("Condition value is required");
    }
  }

  if (!rule.action) {
    errors.push("Action is required");
  } else if (!allowedActionTypes.includes(rule.action.type)) {
    errors.push("Invalid action type");
  }

  if (
  rule.condition?.field === "deliveryType" &&
  rule.condition?.operator === "=" &&
  rule.condition?.value === "STORE_PICKUP" &&
  rule.action?.type === "SET_SHIPPING_PRICE"
) {
  errors.push(
    "No se puede modificar el precio de envío para un retiro en tienda"
  );
}

if (
  rule.condition?.field === "deliveryType" &&
  rule.condition?.operator === "=" &&
  rule.condition?.value === "STORE_PICKUP" &&
  rule.action?.type === "ASSIGN_COURIER"
) {
  errors.push(
    "Courier assignment is not valid when the customer performs the store pickup directly"
  );
}

if (
  rule.action?.type === "ASSIGN_COURIER" &&
  !rule.action.value
) {
  errors.push(
    "Debes indicar el courier"
  );
}

if (
  rule.action?.type === "SET_SHIPPING_PRICE" &&
  (
    typeof rule.action.value !== "number" ||
    Number.isNaN(rule.action.value) ||
    rule.action.value < 0
  )
) {
  errors.push(
    "El precio de envío debe ser un número mayor o igual a cero"
  );
}

if (
  rule.action?.type ===
    "SET_DELIVERY_TYPE_AVAILABILITY" &&
  ![
    "HOME_DELIVERY",
    "STORE_PICKUP",
    "PICKUP_POINT"
  ].includes(rule.action.deliveryType)
) {
  errors.push(
    "Debes indicar un tipo de entrega válido"
  );
}

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRule
};