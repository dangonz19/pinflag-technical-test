CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    name VARCHAR(150) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    condition JSONB NOT NULL,
    action JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    amount INTEGER NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    delivery_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision_logs (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER NOT NULL REFERENCES simulations(id),
    input_snapshot JSONB NOT NULL,
    matched_rules_snapshot JSONB NOT NULL,
    result_snapshot JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);