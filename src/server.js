require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "API y base de datos operativas" });
  } catch (_error) {
    res.status(500).json({ ok: false, message: "Error de conexion con base de datos" });
  }
});

app.get("/api/consumos", async (req, res) => {
  try {
    const { par, orden = "asc" } = req.query;

    const where = [];
    if (par === "true") {
      where.push("consumo_kwh % 2 = 0");
    }

    const safeOrder = orden === "desc" ? "DESC" : "ASC";
    const query = `
      SELECT id, consumo_kwh, created_at
      FROM consumos
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY consumo_kwh ${safeOrder}, id ASC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "No se pudieron listar los consumos", detail: error.message });
  }
});

app.get("/api/consumos/promedio", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT COALESCE(AVG(consumo_kwh), 0)::numeric(10,2) AS promedio, COALESCE(SUM(consumo_kwh), 0) AS total, COUNT(*)::int AS cantidad FROM consumos"
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "No se pudo calcular el promedio", detail: error.message });
  }
});

app.post("/api/consumos", async (req, res) => {
  try {
    const { consumo_kwh } = req.body;

    if (!Number.isInteger(consumo_kwh) || consumo_kwh < 0) {
      return res.status(400).json({ message: "consumo_kwh debe ser un entero mayor o igual a 0" });
    }

    const result = await pool.query(
      "INSERT INTO consumos (consumo_kwh) VALUES ($1) RETURNING id, consumo_kwh, created_at",
      [consumo_kwh]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "No se pudo crear el consumo", detail: error.message });
  }
});

app.put("/api/consumos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { consumo_kwh } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID invalido" });
    }

    if (!Number.isInteger(consumo_kwh) || consumo_kwh < 0) {
      return res.status(400).json({ message: "consumo_kwh debe ser un entero mayor o igual a 0" });
    }

    const result = await pool.query(
      "UPDATE consumos SET consumo_kwh = $1 WHERE id = $2 RETURNING id, consumo_kwh, created_at",
      [consumo_kwh, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Consumo no encontrado" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "No se pudo actualizar el consumo", detail: error.message });
  }
});

app.delete("/api/consumos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const result = await pool.query("DELETE FROM consumos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Consumo no encontrado" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "No se pudo eliminar el consumo", detail: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
