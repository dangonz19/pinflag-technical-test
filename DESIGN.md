# Diseño de la solución

## 1. Requisitos

Para considerar exitosa la solución definí los siguientes requisitos:

- Un mismo pedido, evaluado contra las mismas reglas, debe producir siempre el mismo resultado.
- La marca debe poder expresar qué regla tiene mayor importancia cuando dos reglas intentan modificar el mismo resultado.
- Dos reglas que coinciden pero modifican resultados diferentes deben poder aplicarse al mismo tiempo.
- El resultado debe indicar los tipos de entrega disponibles, el precio del envío y el courier asignado.
- La interfaz debe permitir visualizar reglas, crear nuevas reglas y simular pedidos.
- Una regla inválida debe rechazarse antes de persistirse y la interfaz debe informar el problema.
- Si ninguna regla coincide, el sistema debe entregar un resultado explícito en vez de elegir una regla arbitrariamente.
- Cada simulación debe dejar un registro suficiente para explicar posteriormente qué reglas coincidieron, cuáles se aplicaron y por qué, sin tener que volver a ejecutar el motor.

Para mantener acotado el prototipo decidí trabajar con una condición simple por regla.

---

## 2. Solución propuesta

Separé la solución en frontend, API, motor de reglas y persistencia:

```text
Pedido ingresado en React
          |
          v
     React / Vite
          |
          | HTTP / JSON
          v
   Node.js / Express
          |
          v
      Controller
          |
          +--------------------+
          |                    |
          v                    v
     Rule Engine          PostgreSQL
          |                    |
          |              obtiene reglas
          |                    |
          +---------<----------+
          |
          v
 Evaluar condiciones
          |
          v
 Reglas coincidentes
          |
          v
Resolver conflictos
   por prioridad
          |
          v
 Construir resultado
    y explicación
          |
          v
      PostgreSQL
 simulations + decision_logs
          |
          v
  Resultado hacia React
```

React se ocupa de la interacción con el usuario. Express expone la API y coordina los casos de uso. La decisión sobre qué reglas se aplican vive en el Rule Engine y PostgreSQL se utiliza para persistir reglas, simulaciones y trazabilidad.

### Representación de reglas

Una regla contiene principalmente:

```text
name
priority
condition
action
enabled
```

Elegí almacenar `condition` y `action` como JSONB.

Ejemplo:

```json
{
  "condition": {
    "field": "amount",
    "operator": ">",
    "value": 50000
  },
  "action": {
    "type": "ASSIGN_COURIER",
    "value": "BLUE_EXPRESS"
  }
}
```

Elegí JSONB porque necesitaba representar distintos tipos de condiciones y acciones sin agregar muchas columnas opcionales al modelo. El costo de esta decisión es que parte de la validación queda en el backend.

### Evaluación y conflictos

El motor obtiene las reglas habilitadas y evalúa cada condición contra el pedido.

Que dos reglas coincidan no significa necesariamente que exista un conflicto.

Por ejemplo:

```text
Asignar BLUE_EXPRESS
Precio de envío = 0
```

pueden aplicarse simultáneamente porque modifican resultados diferentes.

En cambio:

```text
Asignar BLUE_EXPRESS
Asignar FEDEX
```

sí genera un conflicto porque ambas reglas intentan asignar courier.

Para expresar la intención de la marca agregué una prioridad numérica. La regla con mayor prioridad gana dentro de un mismo conflicto.

En el caso principal:

```text
Monto > 50000 -> BLUE_EXPRESS -> prioridad 100
Peso < 20     -> FEDEX        -> prioridad 50
Monto > 30000 -> precio = 0   -> prioridad 80
```

Para un pedido de `$60.000` y `2 kg`, Blue Express y FedEx coinciden, pero Blue Express gana por prioridad. La regla de precio también se aplica porque no compite con la asignación de courier.

Si dos reglas que compiten tienen la misma prioridad, utilizo el menor `id` como desempate. Lo elegí para garantizar determinismo en el prototipo, aunque en un producto real también mostraría una advertencia para que la marca resuelva explícitamente el empate.

Para disponibilidad de tipos de entrega, el conflicto considera además qué alternativa se modifica. Por ejemplo, una regla que bloquea `STORE_PICKUP` y otra que bloquea `PICKUP_POINT` pueden convivir.

### Trazabilidad

No guardo solamente el resultado final.

Cada simulación genera un registro en `decision_logs` con:

```text
input_snapshot
matched_rules_snapshot
result_snapshot
```

Esto permite conservar el contexto de una decisión aunque posteriormente cambien las reglas.

### Lo que no resuelve el prototipo

Por alcance dejé fuera:

- condiciones compuestas con AND/OR;
- edición y versionado de reglas desde la interfaz;
- autenticación;
- manejo completo de múltiples marcas en el frontend;
- cobertura completa de todas las posibles contradicciones semánticas;
- tests automatizados.

La base ya relaciona las reglas mediante `brand_id`, pero la interfaz trabaja con una marca de demostración (`brandId = 1`).

---

## 3. Riesgos

### Cambios sobre reglas existentes

Un cambio en la lógica del motor podría modificar el comportamiento de reglas que las marcas ya tienen configuradas.

**Mitigación:** versionaría las reglas o la política de evaluación antes de introducir cambios incompatibles. Antes de una migración validaría las reglas existentes y aquellas incompatibles quedarían marcadas para revisión en vez de eliminarlas o modificarlas silenciosamente.

### Prioridades iguales

Dos reglas pueden competir y tener la misma prioridad. Aunque el `id` garantiza un resultado determinista, puede que ese resultado no represente realmente la intención de la marca.

**Mitigación:** mantendría el desempate determinista como protección técnica, pero el panel debería advertir los conflictos de igual prioridad para que la marca pueda resolverlos explícitamente.

### Flexibilidad de JSONB

JSONB permite representar distintos tipos de reglas de manera simple, pero el esquema de PostgreSQL no puede garantizar por sí solo toda la validez de `condition` y `action`.

**Mitigación:** mantuve validación en el backend antes de persistir reglas. En una evolución agregaría validación más estricta, versionado del esquema de reglas y tests automatizados.

---

## 4. Uso de IA

Utilicé IA como herramienta de apoyo durante el desarrollo de esta prueba. Principalmente la usé para analizar el enunciado, refrescar conceptos de Node.js, Express, PostgreSQL y React, discutir alternativas de arquitectura, obtener propuestas iniciales de código, entender errores durante la implementación y pensar casos de prueba.

Las respuestas de IA las utilicé como punto de partida y fui probando las propuestas en el proyecto antes de mantenerlas.

Un ejemplo de algo que modifiqué fue la resolución de conflictos. Inicialmente se propuso agrupar las reglas solamente por tipo de acción. Al revisar las acciones relacionadas con disponibilidad de entrega, noté que dos reglas podían ser del mismo tipo pero modificar alternativas distintas, por ejemplo `STORE_PICKUP` y `PICKUP_POINT`. En ese caso no deberían competir, por lo que ajusté el motor para que la clave de conflicto también considere el tipo de entrega afectado.

También descarté asumir que un retiro en tienda nunca puede utilizar courier. El enunciado indica que los pedidos de retiro pueden igualmente necesitar un courier para trasladarlos hasta el lugar de retiro, por lo que esa generalización no representaba correctamente el problema.

En general utilicé IA para acelerar el análisis y como apoyo mientras aprendía y desarrollaba. Las decisiones se fueron validando mediante la ejecución del prototipo y las pruebas realizadas.
