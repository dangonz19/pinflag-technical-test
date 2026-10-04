function evaluateCondition(order, condition) {
  const actualValue = order[condition.field];
  const expectedValue = condition.value;

  switch (condition.operator) {
    case ">":
      return actualValue > expectedValue;

    case ">=":
      return actualValue >= expectedValue;

    case "<":
      return actualValue < expectedValue;

    case "<=":
      return actualValue <= expectedValue;

    case "=":
      return actualValue === expectedValue;

    case "!=":
      return actualValue !== expectedValue;

    default:
      return false;
  }
}

function evaluateRules(order, rules) {
  return rules.filter((rule) => {
    if (!rule.enabled) {
      return false;
    }

    return evaluateCondition(order, rule.condition);
  });
}

function getConflictKey(rule) {
  if (
    rule.action.type ===
    "SET_DELIVERY_TYPE_AVAILABILITY"
  ) {
    return `${rule.action.type}:${rule.action.deliveryType}`;
  }

  return rule.action.type;
}


function resolveRules(matchedRules) {
  const winnersByAction = {};

  for (const rule of matchedRules) {
    const conflictKey = getConflictKey(rule);
    const currentWinner = winnersByAction[conflictKey];

    if (
      !currentWinner ||
      rule.priority > currentWinner.priority ||
      (
        rule.priority === currentWinner.priority &&
        rule.id < currentWinner.id
      )
    ) {
      winnersByAction[conflictKey] = rule;
    }
  }

  return Object.values(winnersByAction);
}

function buildResult(winningRules) {
  const result = {
    courier: null,
    shippingPrice: null,
    deliveryTypes: [
      "HOME_DELIVERY",
      "STORE_PICKUP",
      "PICKUP_POINT"
    ]
  };

  for (const rule of winningRules) {
    switch (rule.action.type) {
      case "ASSIGN_COURIER":
        result.courier = rule.action.value;
        break;

      case "SET_SHIPPING_PRICE":
        result.shippingPrice = rule.action.value;
        break;

      case "SET_DELIVERY_TYPE_AVAILABILITY":
        if (rule.action.enabled === false) {
          result.deliveryTypes = result.deliveryTypes.filter(
            (type) => type !== rule.action.deliveryType
          );
        }
        break;
    }
  }

  return result;
}

function buildTrace(matchedRules, winningRules) {
  const winningIds = new Set(
    winningRules.map((rule) => rule.id)
  );

  return matchedRules.map((rule) => {
    const applied = winningIds.has(rule.id);

    if (applied) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        actionType: rule.action.type,
        applied: true,
        reason: "Aplicada por tener la mayor prioridad para esta acción"
      };
    }

    const conflictKey = getConflictKey(rule);

const winner = winningRules.find(
  (winningRule) =>
    getConflictKey(winningRule) === conflictKey
);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      actionType: rule.action.type,
      applied: false,
      reason: winner
        ? `No se aplicó porque la regla ${winner.name} tiene mayor prioridad.`
        : "No aplicada"
    };
  });
}

module.exports = {
  evaluateCondition,
  evaluateRules,
  resolveRules,
  buildResult,
  buildTrace
};