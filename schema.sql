-- Military Asset Management System: PostgreSQL schema (idempotent)
DROP TABLE IF EXISTS audit_logs, expenditures, assignments, transfers, purchases, users, equipment_types, bases CASCADE;

CREATE TABLE bases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(150) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER')),
  base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

CREATE TABLE equipment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('WEAPON','VEHICLE','AMMUNITION'))
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);

CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  source_base_id INT NOT NULL REFERENCES bases(id),
  destination_base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING','IN_TRANSIT','COMPLETED')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  initiated_by INT REFERENCES users(id),
  CHECK (source_base_id <> destination_base_id)
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  personnel_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);

CREATE TABLE expenditures (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  reason VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_base_eq_date ON purchases(base_id, equipment_type_id, created_at);
CREATE INDEX idx_transfers_src ON transfers(source_base_id, equipment_type_id, created_at);
CREATE INDEX idx_transfers_dst ON transfers(destination_base_id, equipment_type_id, created_at);
CREATE INDEX idx_assign_base_eq_date ON assignments(base_id, equipment_type_id, created_at);
CREATE INDEX idx_exp_base_eq_date ON expenditures(base_id, equipment_type_id, created_at);
