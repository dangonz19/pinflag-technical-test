# Diseño de la solución

## 1. Cómo entendí el problema

El objetivo principal que tomé para este proyecto fue que una marca pueda definir reglas de despacho sin que el resultado dependa del orden en que esas reglas fueron creadas o consultadas.

Para el prototipo me enfoqué principalmente en cuatro cosas:

- poder crear y visualizar reglas;
- poder probar esas reglas con un pedido;
- resolver de forma clara cuando dos reglas entran en conflicto;
- guardar suficiente información para poder explicar después por qué se tomó una decisión.

Por alcance decidí trabajar con una condición por regla. Por ejemplo:

```
amount > 50000
```

o:

```
weight < 20
```

Esto mantiene el motor relativamente simple para el prototipo. Si el proyecto evolucionara, agregaría soporte para condiciones compuestas utilizando AND/OR.

---

## 2. Arquitectura

Separé el proyecto en tres partes principales:

```
       React
         |
         | HTTP / JSON
         v
   Node + Express
         |
         v
     Rule Engine
         |
         v
    PostgreSQL
```

React se ocupa de la interfaz.

Express expone la API y coordina las operaciones.

El Rule Engine contiene la lógica que determina qué reglas coinciden y cuáles finalmente se aplican.

PostgreSQL almacena reglas, simulaciones y el historial de decisiones.

Dentro del backend también intenté separar responsabilidades:

```
Route
  |
Controller
  |
Service / Rule Engine
  |
Repository
  |
PostgreSQL
```

La intención fue evitar tener consultas SQL, lógica de reglas y manejo HTTP mezclados en los mismos archivos.

---

## 3. Cómo representé una regla

Una regla tiene información como:

```
name
priority
condition
action
enabled
```

Decidí almacenar `condition` y `action` como JSONB.

Por ejemplo, una condición puede ser:

```json
{
  "field": "amount",
  "operator": ">",
  "value": 50000
}
```

y su acción:

```json
{
  "type": "ASSIGN_COURIER",
  "value": "BLUE_EXPRESS"
}
```

Elegí esta alternativa porque para el prototipo necesitaba soportar distintos tipos de condiciones y acciones sin crear una gran cantidad de columnas que fueran opcionales dependiendo del tipo de regla.

La desventaja es que PostgreSQL no puede validar por sí solo toda la estructura de esos objetos. Por eso parte de esa responsabilidad queda en el backend.

---

## 4. Cómo funciona el motor

Cuando se simula un pedido, primero se cargan las reglas de la marca.

Después el motor revisa las reglas habilitadas y evalúa cada condición contra el pedido.

Por ejemplo, para:

```
Monto: 60000
Peso: 2 kg
```

estas dos condiciones son verdaderas:

```
60000 > 50000
2 < 20
```

Por lo tanto pueden coincidir tanto la regla de Blue Express como la de FedEx.

Pero que dos reglas coincidan no significa necesariamente que estén en conflicto.

Por ejemplo:

```
Asignar BLUE_EXPRESS
```

y:

```
Precio de envío = 0
```

pueden aplicarse juntas porque modifican cosas diferentes.

En cambio:

```
Asignar BLUE_EXPRESS
Asignar FEDEX
```

sí genera un conflicto porque ambas intentan decidir el courier.

---

## 5. Cómo resolví los conflictos

Para resolver un conflicto utilicé una prioridad numérica.

Una prioridad mayor gana sobre una menor.

En los datos de ejemplo:

```
Blue Express -> prioridad 100
FedEx        -> prioridad 50
```

Por eso, aunque las dos reglas coincidan, Blue Express es la que finalmente se aplica.

También necesitaba una respuesta definida si dos reglas tienen exactamente la misma prioridad.

Para ese caso decidí utilizar el `id` menor como desempate.

No considero que sea necesariamente la política definitiva para un producto real, pero permite que el prototipo sea determinista: el mismo pedido y las mismas reglas deberían producir siempre el mismo resultado.

También hice una distinción para las acciones que modifican disponibilidad de tipos de entrega.

Por ejemplo, bloquear `STORE_PICKUP` y bloquear `PICKUP_POINT` son acciones del mismo tipo, pero no deberían competir entre ellas porque afectan alternativas diferentes.

---

## 6. Trazabilidad

Otro punto al que le di importancia fue no guardar solamente el resultado final.

Cada vez que se ejecuta una simulación guardo en `decision_logs`:

```
input_snapshot
matched_rules_snapshot
result_snapshot
```

Esto permite conservar una fotografía de lo que pasó.

Lo consideré importante porque las reglas pueden cambiar con el tiempo.

Por ejemplo, si hoy una regla tiene prioridad 100 y en el futuro alguien la modifica, no sería correcto intentar explicar una decisión antigua únicamente utilizando la versión actual de las reglas.

Con los snapshots puedo consultar qué datos participaron realmente en la decisión original.

---

## 7. Validación de reglas

Las reglas se validan antes de guardarse.

El frontend ayuda a que el usuario introduzca valores válidos, pero decidí mantener la validación principal en el backend.

Esto es importante porque la API también puede utilizarse sin pasar por React.

Si una regla no es válida, el backend responde con un error y no se guarda en PostgreSQL.

Durante las pruebas también agregué algunas validaciones entre el tipo de condición y la acción para evitar configuraciones que no tengan sentido dentro del alcance definido para el prototipo.

---

## 8. Decisiones 

Por el tiempo y el alcance de la prueba tuve que simplificar algunas partes.

### Una condición por regla

Actualmente una regla representa una condición sencilla.
