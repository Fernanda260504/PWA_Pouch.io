const btnSubmit = document.getElementById("submit");
const inputName = document.getElementById("name");
const inputAge = document.getElementById("age");
const inputEmail = document.getElementById("email");
const divCards = document.getElementById("cards");

const db = new PouchDB("personas");

btnSubmit.addEventListener("click", (event) => {
  event.preventDefault();

  if (!inputName.value || !inputAge.value || !inputEmail.value) {
    alert("Por favor, rellena todos los campos.");
    return;
  }

  const persona = {
    _id: new Date().toISOString(),
    name: inputName.value,
    age: inputAge.value,
    email: inputEmail.value,
    status: "pending",
  };

  db.put(persona)
    .then((response) => {
      console.log("Persona registrada con éxito:", response);
      inputName.value = "";
      inputAge.value = "";
      inputEmail.value = "";
      getPersonas();
    })
    .catch((err) => {
      console.error("Error al guardar a la persona:", err);
    });
});

/**
 * Función que genera una tarjeta de persona usando Bootstrap.
 * @param {Object} persona - El objeto persona de PouchDB.
 * @returns {HTMLElement}
 */
function createPersonCard(persona) {
  const cardCol = document.createElement("div");

  cardCol.className = "col-lg-4 col-md-6 mb-4";

  const card = document.createElement("div");
  card.className = "card h-100 shadow-sm";

  let statusClass = "text-bg-warning";
  if (persona.status === "pending") {
    statusClass = "text-bg-warning";
  } else if (persona.status === "active") {
    statusClass = "text-bg-success";
  }

  card.innerHTML = `
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">${persona.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${persona.email}</h6>
            <p class="card-text">
                <span class="fw-bold">Edad:</span> ${persona.age}<br>
                <span class="badge ${statusClass}">${persona.status.toUpperCase()}</span>
            </p>
            <div class="mt-auto pt-2">
                <button type="button" class="btn btn-danger btn-sm w-100" onclick="Eliminar('${
                  persona._id
                }')">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;

  cardCol.appendChild(card);
  return cardCol;
}

function getPersonas() {
  db.allDocs({ include_docs: true, descending: true })
    .then((response) => {
      divCards.innerHTML = "";

      if (!divCards.classList.contains("row")) {
        divCards.classList.add("row");
      }

      if (response.rows.length === 0) {
        divCards.innerHTML =
          '<p class="text-center w-100 mt-4">No hay personas registradas</p>';
        return;
      }

      response.rows.forEach((row) => {
        const persona = row.doc;
        const card = createPersonCard(persona);
        divCards.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Error al obtener los documentos:", err);
      divCards.innerHTML =
        '<p class="text-danger w-100 mt-4">Error al cargar los datos.</p>';
    });
}

function Eliminar(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este registro?")) {
    return;
  }

  db.get(id)
    .then(function (doc) {
      return db.remove(doc._id, doc._rev);
    })
    .then(function (result) {
      console.log("Eliminada correctamente:", result);
      getPersonas();
    })
    .catch(function (err) {
      console.error("Error al eliminar:", err);
      alert("Hubo un error al intentar eliminar el registro.");
    });
}

getPersonas();
