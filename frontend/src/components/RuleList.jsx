function RuleList({ rules }) {
  return (
    <section>
      <h2>Reglas de despacho</h2>

      {rules.map((rule) => (
        <article key={rule.id}>
          <h3>{rule.name}</h3>

          <p>
            <strong>Prioridad:</strong> {rule.priority}
          </p>

          <p>
            <strong>Condición:</strong>{" "}
            {rule.condition.field}{" "}
            {rule.condition.operator}{" "}
            {String(rule.condition.value)}
          </p>

          <p>
            <strong>Acción:</strong>{" "}
            {rule.action.type}
          </p>
        </article>
      ))}
    </section>
  );
}

export default RuleList;