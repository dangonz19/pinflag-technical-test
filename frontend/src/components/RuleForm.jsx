import { useState } from "react";

function RuleForm({ onRuleCreated }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(50);

  const [field, setField] = useState("amount");
  const [operator, setOperator] = useState(">");
  const [value, setValue] = useState("");

  const [actionType, setActionType] =
    useState("ASSIGN_COURIER");

  const [actionValue, setActionValue] = useState("");
  const [actionDeliveryType, setActionDeliveryType] =
    useState("STORE_PICKUP");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericFields = ["amount", "weight"];

    const conditionValue = numericFields.includes(field)
      ? Number(value)
      : value;

    let action;

    if (actionType === "ASSIGN_COURIER") {
      action = {
        type: actionType,
        value: actionValue
      };
    }

    if (actionType === "SET_SHIPPING_PRICE") {
      action = {
        type: actionType,
        value: Number(actionValue)
      };
    }

    if (
      actionType === "SET_DELIVERY_TYPE_AVAILABILITY"
    ) {
      action = {
        type: actionType,
        deliveryType: actionDeliveryType,
        enabled: false
      };
    }

    const rule = {
      brandId: 1,
      name,
      priority: Number(priority),
      condition: {
        field,
        operator,
        value: conditionValue
      },
      action
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/rules",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(rule)
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.details?.join(", ") ||
          json.error ||
          "No se pudo crear la regla"
        );
      }

      setSuccess("Regla creada correctamente");
      setName("");
      setValue("");
      setActionValue("");

      onRuleCreated();

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Nueva regla</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </label>

        <label>
          Prioridad
          <input
            type="number"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            required
          />
        </label>

        <h3>Condición</h3>

        <label>
          Campo
          <select
            value={field}
            onChange={(event) => {
              const newField = event.target.value;

              setField(newField);

              if (
                newField === "commune" ||
                newField === "deliveryType"
              ) {
                setOperator("=");
              }
            }}
          >
            <option value="amount">Monto</option>
            <option value="weight">Peso</option>
            <option value="commune">Comuna</option>
            <option value="deliveryType">
              Tipo de entrega
            </option>
          </select>
        </label>

        <label>
          Operador
          <select
            value={operator}
            onChange={(event) =>
              setOperator(event.target.value)
            }
          >
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="=">=</option>
            <option value="!=">!=</option>
          </select>
        </label>

        <label>
          Valor

          {field === "deliveryType" ? (
            <select
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              required
            >
              <option value="">
                Selecciona...
              </option>

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
          ) : (
            <input
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              required
            />
          )}
        </label>

        <h3>Acción</h3>

        <label>
          Tipo
          <select
            value={actionType}
            onChange={(event) =>
              setActionType(event.target.value)
            }
          >
            <option value="ASSIGN_COURIER">
              Asignar courier
            </option>

            <option value="SET_SHIPPING_PRICE">
              Modificar precio de envío
            </option>

            <option value="SET_DELIVERY_TYPE_AVAILABILITY">
              Bloquear tipo de entrega
            </option>
          </select>
        </label>

        {actionType ===
        "SET_DELIVERY_TYPE_AVAILABILITY" ? (
          <label>
            Tipo de entrega a bloquear

            <select
              value={actionDeliveryType}
              onChange={(event) =>
                setActionDeliveryType(event.target.value)
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
        ) : (
          <label>
            Valor
            <input
              value={actionValue}
              onChange={(event) =>
                setActionValue(event.target.value)
              }
              required
            />
          </label>
        )}

        <button type="submit">
          Crear regla
        </button>

        {error && (
          <p>
            <strong>Error:</strong> {error}
          </p>
        )}

        {success && <p>{success}</p>}
      </form>
    </section>
  );
}

export default RuleForm;