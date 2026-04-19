CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id varchar(255) PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  description text NOT NULL,
  location varchar(255) NOT NULL,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  equipment_id uuid NULL REFERENCES equipments(id) ON DELETE SET NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'reserved',
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipments_facility_id
  ON equipments(facility_id);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id
  ON reservations(user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_facility_id
  ON reservations(facility_id);

CREATE INDEX IF NOT EXISTS idx_reservations_equipment_id
  ON reservations(equipment_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations(status);

CREATE INDEX IF NOT EXISTS idx_reservations_start_end
  ON reservations(start_at, end_at);
