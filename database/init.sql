CREATE TABLE IF NOT EXISTS consumos (
  id SERIAL PRIMARY KEY,
  consumo_kwh INTEGER NOT NULL CHECK (consumo_kwh >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
