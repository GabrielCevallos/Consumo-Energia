# ⚡ Sistema de Consumo de Energía Eléctrica

Aplicación web desarrollada con JavaScript y Node.js para registrar consumos mensuales de energía eléctrica domiciliaria, con CRUD completo, filtro de consumos pares, orden ascendente/descendente y cálculo del promedio total.

## 🎯 Objetivo del proyecto

Permitir que un usuario:

1. Ingrese una lista de números (consumos mensuales en kWh).
2. Filtre consumos pares.
3. Ordene resultados en forma ascendente o descendente.
4. Visualice promedio, total y cantidad de consumos registrados.
5. Gestione los registros con operaciones CRUD.


## 🏗️ Arquitectura implementada

1. **Frontend web**: HTML, CSS y JavaScript puro en `public/`.
2. **Backend**: API REST con Express en `src/server.js`.
3. **Persistencia**: PostgreSQL, conexión con `pg` en `src/db.js`.
4. **Inicialización de DB**: script SQL en `database/init.sql`.

## 📁 Estructura del proyecto

```txt
Consumo-Energia/
	database/
		init.sql
	public/
		app.js
		index.html
		styles.css
	src/
		db.js
		server.js
	.env.example
	.gitignore
	docker-compose.yml
	package.json
	README.md
```

## 🗄️ Modelo de datos

Tabla: `consumos`

1. `id` (SERIAL, PK)
2. `consumo_kwh` (INTEGER, >= 0)
3. `created_at` (TIMESTAMP)

## 🔌 Endpoints principales

1. `GET /api/health` -> estado de API y DB.
2. `GET /api/consumos?par=true&orden=asc|desc` -> lista consumos con filtro y orden.
3. `GET /api/consumos/promedio` -> devuelve promedio, total y cantidad.
4. `POST /api/consumos` -> crea consumo (`{ "consumo_kwh": 200 }`).
5. `PUT /api/consumos/:id` -> actualiza consumo.
6. `DELETE /api/consumos/:id` -> elimina consumo.

## 🚀 Cómo ejecutar el proyecto

### Opción A: con Docker (recomendada para DB)

#### 1) Levantar PostgreSQL

```bash
docker compose up -d
```

#### 2) Instalar dependencias

```bash
npm install
```

#### 3) Configurar variables de entorno

```bash
copy .env.example .env
```

Si usas PowerShell:

```powershell
Copy-Item .env.example .env
```

#### 4) Iniciar servidor

```bash
npm run dev
```

#### 5) Abrir aplicación

1. Navega a `http://localhost:3000`

### Opción B: PostgreSQL local sin Docker

1. Crea una base llamada `consumo_energia`.
2. Ejecuta `database/init.sql`.
3. Ajusta `.env` con tu usuario/clave/host/puerto.
4. Ejecuta:

```bash
npm install
npm run dev
```

## ✅ Resultado

Se implementó una solución web completa con Node.js + PostgreSQL que cumple con:

1. Ingreso de consumos mensuales.
2. Filtro de números pares.
3. Orden ascendente/descendente.
4. Cálculo de promedio total.
5. Persistencia en base SQL y CRUD básico.