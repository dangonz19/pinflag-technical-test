TRUNCATE TABLE decision_logs, simulations, rules, brands
RESTART IDENTITY CASCADE;

INSERT INTO brands (name)
VALUES ('Demo Store');


INSERT INTO rules (
    brand_id,
    name,
    priority,
    condition,
    action
)
VALUES
(
    1,
    'Pedidos sobre 50000 con Blue Express',
    100,
    '{"field": "amount", "operator": ">", "value": 50000}'::jsonb,
    '{"type": "ASSIGN_COURIER", "value": "BLUE_EXPRESS"}'::jsonb
),
(
    1,
    'Pedidos menores a 20 kg con FedEx',
    50,
    '{"field": "weight", "operator": "<", "value": 20}'::jsonb,
    '{"type": "ASSIGN_COURIER", "value": "FEDEX"}'::jsonb
),
(
    1,
    'Envio gratis sobre 30000',
    80,
    '{"field": "amount", "operator": ">", "value": 30000}'::jsonb,
    '{"type": "SET_SHIPPING_PRICE", "value": 0}'::jsonb
);


INSERT INTO simulations (
    brand_id,
    amount,
    weight,
    commune,
    delivery_type
)
VALUES (
    1,
    60000,
    2,
    'Providencia',
    'HOME_DELIVERY'
);