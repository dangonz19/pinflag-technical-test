import { useState } from "react";

function OrderSimulator() {
  const [amount, setAmount] = useState(60000);
  const [weight, setWeight] = useState(2);
  const [commune, setCommune] = useState("Providencia");
  const [deliveryType, setDeliveryType] =
    useState("HOME_DELIVERY");

  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSimulation(null);

    const order = {
      brandId: 1,
      amount: Number(amount),
      weight: Number(weight),
      commune,
      deliveryType
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/simulations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(order)
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error || "No se pudo simular el pedido"
        );
      }

      setSimulation(json);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Simular pedido</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Monto
          <input
            type="number"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            required
          />
        </label>

        <label>
          Peso (kg)
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(event) =>
              setWeight(event.target.value)
            }
            required
          />
        </label>

        <label>
          Comuna
          <input
            value={commune}
            onChange={(event) =>
              setCommune(event.target.value)
            }
            required
          />
        </label>

        <label>
          Tipo de entrega
          <select
            value={deliveryType}
            onChange={(event) =>
              setDeliveryType(event.target.value)
            }
          >
            <option value="HOME_DELIVERY">
              Despacho a domicilio
            </option>

            <option value="STORE_PICKUP">
              Retiro en tienda
            </option>

            <option value="PICKUP_POINT">
              Punto de retiro
            </option>
          </select>
        </label>

        <button type="submit">
          Simular
        </button>
      </form>

      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}

      {simulation && (
        <section>
          <h3>Resultado</h3>

          <p>
            <strong>Courier:</strong>{" "}
            {simulation.result.courier || "Sin asignar"}
          </p>

          <p>
            <strong>Precio de envío:</strong>{" "}
            {simulation.result.shippingPrice === null
              ? "Sin modificación"
              : `$${simulation.result.shippingPrice}`}
          </p>

          <p>
            <strong>Tipos de entrega disponibles:</strong>{" "}
            {simulation.result.deliveryTypes.join(", ")}
          </p>

          <h3>¿Por qué?</h3>

          {simulation.matchedRules.length === 0 ? (
            <p>
              Ninguna regla configurada coincide con este pedido.
            </p>
          ) : (
            <ul>
              {simulation.matchedRules.map((rule) => (
                <li key={rule.ruleId}>
                  <strong>{rule.ruleName}</strong>
                  {" — "}
                  {rule.applied ? "Aplicada" : "No aplicada"}
                  {" — "}
                  {rule.reason}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}

export default OrderSimulator;