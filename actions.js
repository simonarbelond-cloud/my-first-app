
"use strict";

// ==========================================
// 1. ELEMENTOS HTML
// ==========================================

const counter = document.getElementById("counter");
const timer = document.getElementById("timer");

const clickButton = document.getElementById("clickButton");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

const durationSelect = document.getElementById("durationSelect");
const timerProgress = document.getElementById("timerProgress");

const message = document.getElementById("message");

const titleInput = document.getElementById("titleInput");
const eventTitle = document.getElementById("eventTitle");


// ==========================================
// 2. VARIABLES DEL JUEGO
// ==========================================

let clicks = 0;

let duration = 10;

let startTime = 0;

let elapsedTime = 0;

let animationFrame = null;

let gameActive = false;

let gameFinished = false;


// ==========================================
// 3. FORMATO DEL TEMPORIZADOR
// ==========================================

function formatTime(milliseconds) {

    const totalMs = Math.floor(milliseconds);

    const minutes = Math.floor(totalMs / 60000);

    const seconds = Math.floor((totalMs % 60000) / 1000);

    const ms = totalMs % 1000;

    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(ms).padStart(3, "0")
    );
}


// ==========================================
// 4. ACTUALIZAR INTERFAZ
// ==========================================

function updateCounter() {

    counter.textContent = clicks.toLocaleString("es-CO");

}


function updateTimer(milliseconds) {

    timer.textContent = formatTime(milliseconds);

    const percentage = Math.min(
        (milliseconds / (duration * 1000)) * 100,
        100
    );

    timerProgress.style.width = percentage + "%";

}


// ==========================================
// 5. SELECCIONAR DURACIÓN
// ==========================================

durationSelect.addEventListener("change", function () {

    if (gameActive || gameFinished) return;

    duration = Number(durationSelect.value);

    elapsedTime = 0;

    updateTimer(0);

});


// ==========================================
// 6. INICIAR PARTIDA
// ==========================================

startButton.addEventListener("click", function () {

    if (gameActive || gameFinished) return;

    duration = Number(durationSelect.value);

    clicks = 0;
    elapsedTime = 0;

    updateCounter();
    updateTimer(0);

    gameActive = true;

    startButton.disabled = true;
    clickButton.disabled = false;
    durationSelect.disabled = true;

    message.classList.remove("success");

    message.textContent = "¡Partida en curso! Haz tantos clicks como puedas.";

    // Capturar el tiempo inicial de alta precisión.
    startTime = performance.now();

    // Comenzar la actualización del cronómetro.
    animationFrame = requestAnimationFrame(updateGame);

});


// ==========================================
// 7. MOTOR DEL CRONÓMETRO
// ==========================================

function updateGame(currentTime) {

    if (!gameActive) return;

    elapsedTime = currentTime - startTime;

    const totalDuration = duration * 1000;

    // Comprobar si terminó el tiempo.
    if (elapsedTime >= totalDuration) {

        elapsedTime = totalDuration;

        updateTimer(elapsedTime);

        finishGame();

        return;

    }

    updateTimer(elapsedTime);

    // Continuar actualizando en tiempo real.
    animationFrame = requestAnimationFrame(updateGame);

}


// ==========================================
// 8. REGISTRAR CLICKS
// ==========================================

clickButton.addEventListener("click", function () {

    if (!gameActive || gameFinished) return;

    // Evitar registrar clicks después del tiempo límite.
    if (performance.now() - startTime >= duration * 1000) {

        finishGame();

        return;

    }

    clicks++;

    updateCounter();

});


// ==========================================
// 9. FINALIZAR PARTIDA
// ==========================================

function finishGame() {

    if (!gameActive) return;

    gameActive = false;
    gameFinished = true;

    // Detener la animación del cronómetro.
    if (animationFrame !== null) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

    // Bloquear los controles de juego.
    clickButton.disabled = true;
    startButton.disabled = true;
    durationSelect.disabled = true;

    // Mostrar el tiempo exacto final.
    elapsedTime = duration * 1000;

    updateTimer(elapsedTime);

    timerProgress.style.width = "100%";

    // Mostrar el resultado.
    message.classList.add("success");

    message.textContent =
        "¡Tiempo terminado! Conseguíste " +
        clicks.toLocaleString("es-CO") +
        " clicks en " +
        duration +
        " segundos. ¡Excelente participación!";

}


// ==========================================
// 10. REINICIAR PARTIDA
// ==========================================

resetButton.addEventListener("click", function () {

    // Detener cualquier animación pendiente.
    if (animationFrame !== null) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

    // Restablecer todas las variables.
    clicks = 0;

    elapsedTime = 0;

    startTime = 0;

    gameActive = false;

    gameFinished = false;

    duration = Number(durationSelect.value);

    // Restablecer interfaz.
    updateCounter();

    updateTimer(0);

    timerProgress.style.width = "0%";

    // Habilitar configuración e inicio.
    durationSelect.disabled = false;

    startButton.disabled = false;

    clickButton.disabled = true;

    // Restablecer mensaje.
    message.classList.remove("success");

    message.textContent =
        "Partida reiniciada. ¡Prepárate para jugar!";

});


// ==========================================
// 11. PERSONALIZAR TÍTULO
// ==========================================

titleInput.addEventListener("input", function () {

    const newTitle = titleInput.value.trim();

    eventTitle.textContent =
        newTitle || "Contador de Eventos";

});


// ==========================================
// 12. INICIALIZACIÓN
// ==========================================

duration = Number(durationSelect.value);

updateCounter();

updateTimer(0);

clickButton.disabled = true;

startButton.disabled = false;
