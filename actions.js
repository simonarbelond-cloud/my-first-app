
/* ==============================
   VARIABLES PRINCIPALES
============================== */

let clicks = 0;
let eventTitle = "Contador de Eventos";

/* ==============================
   ELEMENTOS HTML
============================== */

const counterDisplay = document.getElementById("counter");

const clickButton = document.getElementById("clickButton");

const resetButton = document.getElementById("resetButton");

const titleInput = document.getElementById("titleInput");

const titleDisplay = document.getElementById("eventTitle");

/* ==============================
   ACTUALIZAR CONTADOR
============================== */

function updateCounter() {
    counterDisplay.textContent = clicks;
}

/* ==============================
   INCREMENTAR CONTADOR
============================== */

clickButton.addEventListener("click", function () {

    clicks++;

    updateCounter();

});

/* ==============================
   REINICIAR CONTADOR
============================== */

resetButton.addEventListener("click", function () {

    clicks = 0;

    updateCounter();

});

/* ==============================
   CAMBIAR TÍTULO EN TIEMPO REAL
============================== */

titleInput.addEventListener("input", function () {

    const newTitle = titleInput.value.trim();

    if (newTitle === "") {
        titleDisplay.textContent = "Contador de Eventos";
        eventTitle = "Contador de Eventos";
    } else {
        titleDisplay.textContent = newTitle;
        eventTitle = newTitle;
    }

});
