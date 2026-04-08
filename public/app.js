const form = document.getElementById("form-consumo");
const inputConsumo = document.getElementById("consumo");
const tabla = document.getElementById("tabla-consumos");
const soloPares = document.getElementById("solo-pares");
const orden = document.getElementById("orden");
const stats = document.getElementById("stats");

function buildQuery() {
  const params = new URLSearchParams();
  params.set("orden", orden.value);
  if (soloPares.checked) {
    params.set("par", "true");
  }
  return params.toString();
}

async function fetchStats() {
  const response = await fetch("/api/consumos/promedio");
  if (!response.ok) {
    throw new Error("No se pudo cargar estadisticas");
  }
  const data = await response.json();
  stats.innerHTML = `
    <span>Promedio: ${Number(data.promedio).toFixed(2)}</span>
    <span>Total: ${data.total}</span>
    <span>Registros: ${data.cantidad}</span>
  `;
}

function renderRows(consumos) {
  tabla.innerHTML = "";
  if (!consumos.length) {
    tabla.innerHTML = `<tr><td colspan="4">No hay consumos registrados.</td></tr>`;
    return;
  }

  consumos.forEach((item) => {
    const tr = document.createElement("tr");
    const fecha = new Date(item.created_at).toLocaleString();

    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.consumo_kwh}</td>
      <td>${fecha}</td>
      <td>
        <div class="actions">
          <button class="secondary" data-action="edit" data-id="${item.id}" data-value="${item.consumo_kwh}">Editar</button>
          <button data-action="delete" data-id="${item.id}">Eliminar</button>
        </div>
      </td>
    `;

    tabla.appendChild(tr);
  });
}

async function fetchConsumos() {
  const response = await fetch(`/api/consumos?${buildQuery()}`);
  if (!response.ok) {
    throw new Error("No se pudieron listar los consumos");
  }
  const data = await response.json();
  renderRows(data);
}

async function loadData() {
  await Promise.all([fetchConsumos(), fetchStats()]);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = Number(inputConsumo.value);

  if (!Number.isInteger(value) || value < 0) {
    alert("El consumo debe ser un numero entero mayor o igual a 0");
    return;
  }

  const response = await fetch("/api/consumos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumo_kwh: value })
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.message || "No se pudo registrar el consumo");
    return;
  }

  form.reset();
  await loadData();
});

tabla.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const id = target.dataset.id;
  const action = target.dataset.action;

  if (action === "delete") {
    const ok = confirm("Deseas eliminar este consumo?");
    if (!ok) {
      return;
    }

    const response = await fetch(`/api/consumos/${id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("No se pudo eliminar");
      return;
    }

    await loadData();
    return;
  }

  if (action === "edit") {
    const current = Number(target.dataset.value);
    const next = prompt("Nuevo valor de consumo (kWh)", String(current));
    if (next === null) {
      return;
    }

    const numeric = Number(next);
    if (!Number.isInteger(numeric) || numeric < 0) {
      alert("El consumo debe ser un numero entero mayor o igual a 0");
      return;
    }

    const response = await fetch(`/api/consumos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consumo_kwh: numeric })
    });

    if (!response.ok) {
      alert("No se pudo actualizar");
      return;
    }

    await loadData();
  }
});

soloPares.addEventListener("change", fetchConsumos);
orden.addEventListener("change", fetchConsumos);

loadData().catch((error) => {
  console.error(error);
  alert("No se pudo cargar la aplicacion. Verifica API y base de datos.");
});
