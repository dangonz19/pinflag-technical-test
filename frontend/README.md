# Pinflag Shipping Rules

Prototipo de un sistema configurable de reglas de despacho desarrollado como parte de la prueba técnica de Pinflag.

La aplicación permite configurar reglas de despacho, simular pedidos, resolver conflictos entre reglas y mostrar una explicación del resultado obtenido.

## Tecnologías utilizadas

### Backend
- Node.js
- Express
- PostgreSQL
- `pg`
- dotenv
- CORS

### Frontend
- React
- Vite

### Base de datos
- PostgreSQL
- JSONB para almacenar condiciones, acciones y snapshots de decisiones

---

## Estructura del proyecto

```
pinflag-technical-test/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── .gitignore
├── DESIGN.md
└── README.md
```

---

## Requisitos

Para ejecutar el proyecto se necesita:

- Node.js
- npm
- PostgreSQL

---

## Instalación

### 1. Crear la base de datos

Ingresar a PostgreSQL:

```bash
psql -U postgres
```

Crear la base:

```sql
CREATE DATABASE pinflag;
```

Salir de `psql`:

```
\q
```

---

### 2. Crear las tablas

Desde la raíz del proyecto ejecutar:

```bash
psql -U postgres -d pinflag -f database/schema.sql
```

Esto crea las tablas utilizadas por la aplicación:

- `brands`
- `rules`
- `simulations`
- `decision_logs`

---

### 3. Cargar los datos de demostración

Ejecutar:

```bash
psql -U postgres -d pinflag -f database/seed.sql
```

El seed carga una marca de demostración y reglas que permiten probar el escenario principal del desafío.

> Nota: `seed.sql` reinicia los datos de demostración antes de cargarlos nuevamente.

---

## Configurar el backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` utilizando `.env.example` como referencia:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pinflag
DB_USER=postgres
DB_PASSWORD=your_password
```

Reemplazar `your_password` por la contraseña local de PostgreSQL.



### Ejecutar el backend

```bash
npm run dev
```

Por defecto, la API estará disponible en:

```
http://localhost:3001
```

---

## Endpoints principales

### Health check

```
GET /api/health
```

Permite comprobar que la API está funcionando.

### Listar reglas

```
GET /api/rules
```

Devuelve las reglas configuradas para la marca de demostración.

### Crear regla

```
POST /api/rules
```

Permite crear una nueva regla después de pasar por las validaciones correspondientes.

### Simular pedido

```
POST /api/simulations
```

Evalúa un pedido utilizando las reglas configuradas, resuelve los conflictos del caso y persiste la trazabilidad de la decisión.

---

## Ejecutar el frontend

Abrir una segunda terminal y entrar a:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Iniciar Vite:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local del frontend.

Durante el desarrollo normalmente el frontend y el backend se ejecutan simultáneamente en terminales separadas.

---

## Funcionalidades

Desde la interfaz se puede:

- visualizar las reglas configuradas;
- crear nuevas reglas;
- definir condiciones por monto, peso, comuna o tipo de entrega;
- definir diferentes acciones;
- simular un pedido;
- visualizar el resultado de la simulación;
- consultar qué reglas coincidieron;
- ver qué reglas fueron aplicadas;
- entender por qué una regla ganó frente a otra;
- representar el caso en que ninguna regla coincide;
- rechazar configuraciones inválidas antes de persistirlas.

---

## Caso principal de demostración

Los datos de demostración incluyen las siguientes reglas:

```
Monto > 50000
→ ASSIGN_COURIER = BLUE_EXPRESS
→ Prioridad 100
```

```
Peso < 20
→ ASSIGN_COURIER = FEDEX
→ Prioridad 50
```

```
Monto > 30000
→ SET_SHIPPING_PRICE = 0
→ Prioridad 80
```

Para probar el caso principal utilizar:

```
Monto: 60000
Peso: 2 kg
Comuna: Providencia
Tipo de entrega: HOME_DELIVERY
```

Resultado esperado:

```
Courier: BLUE_EXPRESS
Precio de envío: 0
```

Blue Express y FedEx coinciden y ambas intentan asignar un courier. Blue Express gana por tener mayor prioridad.

La regla de envío gratuito también se aplica porque modifica el precio de envío y no entra en conflicto con la asignación de courier.

---

## Otros casos probados

### Ninguna regla coincide

```
Monto: 100
Peso: 20 kg
```

La interfaz muestra el pedido sin courier asignado, sin modificación de precio y explica que ninguna regla coincide.

### Disponibilidad de tipo de entrega

Una regla puede deshabilitar un tipo de entrega.

Por ejemplo:

```
Peso > 20
→ STORE_PICKUP no disponible
```

### Regla inválida

Las nuevas reglas son validadas por el backend antes de guardarse.

Si una configuración es inválida, la API devuelve un error, la interfaz lo muestra y la regla no se persiste.
