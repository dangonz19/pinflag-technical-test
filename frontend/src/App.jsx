import { useEffect, useState } from "react";
import "./App.css";
import OrderSimulator from "./components/OrderSimulator";
import RuleList from "./components/RuleList";
import RuleForm from "./components/RuleForm";

function App() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRules() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/rules"
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar las reglas"
        );
      }

      const json = await response.json();

      setRules(json.data);
      setError("");

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  return (
    <main>
      <h1>Pinflag Shipping Rules</h1>

      <p>
        Reglas configuradas para Demo Store
      </p>

      <RuleForm onRuleCreated={loadRules} />

      <OrderSimulator />
      
      {loading && <p>Cargando reglas...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <RuleList rules={rules} />
      )}
    </main>
  );
}

export default App;