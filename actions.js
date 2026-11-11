
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

const playerNameInput = document.getElementById("playerName");

const titleInput = document.getElementById("titleInput");
const eventTitle = document.getElementById("eventTitle");

const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const closeLeaderboard = document.getElementById("closeLeaderboard");

const leaderboardCategory = document.getElementById("leaderboardCategory");
const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardInfo = document.getElementById("leaderboardInfo");


// ==========================================
// 2. CONFIGURACIÓN DEL JUEGO
// ==========================================

const STORAGE_KEY = "colegioBolivarLeaderboard_v1";

const MAX_RANKING = 10;

let clicks = 0;
let duration = 10;

let startTime = 0;
let elapsedTime = 0;

let animationFrame = null;

let gameActive = false;
let gameFinished = false;

let currentPlayer = "";


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
// 5. ALMACENAMIENTO LOCAL
// ==========================================

// Estructura:
// {
//   "10": [],
//   "20": [],
//   "30": []
// }

function getEmptyLeaderboard() {

    return {
        "10": [],
        "20": [],
        "30": []
    };

}


function loadLeaderboard() {

    try {

        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return getEmptyLeaderboard();
        }

        const parsedData = JSON.parse(storedData);

        const leaderboard = getEmptyLeaderboard();

        ["10", "20", "30"].forEach(category => {

            if (Array.isArray(parsedData[category])) {

                leaderboard[category] = parsedData[category]
                    .filter(entry =>
                        entry &&
                        typeof entry.name === "string" &&
                        entry.name.trim() !== "" &&
                        Number.isSafeInteger(entry.clicks) &&
                        entry.clicks >= 0 &&
                        typeof entry.date === "string"
                    )
                    .map(entry => ({
                        name: entry.name.trim(),
                        clicks: entry.clicks,
                        date: entry.date
                    }))
                    .sort((a, b) =>
                        b.clicks - a.clicks ||
                        a.date.localeCompare(b.date)
                    )
                    .slice(0, MAX_RANKING);

            }

        });

        return leaderboard;

    } catch (error) {

        console.error("Error leyendo el ranking:", error);

        return getEmptyLeaderboard();

    }

}


function saveLeaderboard(data) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error("Error guardando el ranking:", error);

        return false;

    }

}


// ==========================================
// 6. GUARDAR RESULTADO
// ==========================================

function registerScore() {

    const leaderboard = loadLeaderboard();

    const category = String(duration);

    const ranking = leaderboard[category];

    const normalizedName = currentPlayer
        .trim()
        .toLocaleLowerCase("es");

    // Buscar si el jugador ya tiene un récord.
    const existingIndex = ranking.findIndex(entry =>
        entry.name.trim().toLocaleLowerCase("es") === normalizedName
    );

    let isNewRecord = false;

    if (existingIndex !== -1) {

        // Actualizar solamente si supera su récord anterior.
        if (clicks > ranking[existingIndex].clicks) {

            ranking[existingIndex].clicks = clicks;

            ranking[existingIndex].date = new Date().toISOString();

            isNewRecord = true;

        }

    } else {

        // Nuevo participante.
        ranking.push({

            name: currentPlayer,

            clicks: clicks,

            date: new Date().toISOString()

        });

        isNewRecord = true;

    }

    // Ordenar de mayor a menor puntuación.
    ranking.sort((a, b) =>
        b.clicks - a.clicks ||
        a.date.localeCompare(b.date)
    );

    // Conservar únicamente los 10 mejores.
    leaderboard[category] = ranking.slice(0, MAX_RANKING);

    // Guardar en localStorage.
    const saved = saveLeaderboard(leaderboard);

    // Determinar la posición del participante.
    const finalPosition = leaderboard[category].findIndex(entry =>
        entry.name.trim().toLocaleLowerCase("es") === normalizedName
    ) + 1;

    return {
        saved,
        isNewRecord,
        position: finalPosition,
        qualified: finalPosition > 0
    };

}


// ==========================================
// 7. RENDERIZAR TABLA DE POSICIONES
// ==========================================

function renderLeaderboard() {

    const category = leaderboardCategory.value;

    const leaderboard = loadLeaderboard();

    const ranking = leaderboard[category];

    // Limpiar tabla anterior.
    leaderboardBody.replaceChildren();

    if (ranking.length === 0) {

        const row = document.createElement("tr");

        row.className = "empty-row";

        const cell = document.createElement("td");

        cell.colSpan = 3;

        cell.textContent =
            "Todavía no hay participantes en esta categoría. ¡Sé el primero!";

        row.appendChild(cell);

        leaderboardBody.appendChild(row);

        leaderboardInfo.textContent =
            "El ranking se actualizará automáticamente después de cada partida.";

        return;

    }

    ranking.forEach((entry, index) => {

        const row = document.createElement("tr");

        const positionCell = document.createElement("td");

        const nameCell = document.createElement("td");

        const scoreCell = document.createElement("td");

        // Medallas para los tres primeros.
        if (index === 0) {
            positionCell.textContent = "🥇";
        } else if (index === 1) {
            positionCell.textContent = "🥈";
        } else if (index === 2) {
            positionCell.textContent = "🥉";
        } else {
            positionCell.textContent = index + 1;
        }

        nameCell.textContent = entry.name;

        scoreCell.textContent =
            entry.clicks.toLocaleString("es-CO");

        row.appendChild(positionCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);

        leaderboardBody.appendChild(row);

    });

    leaderboardInfo.textContent =
        "Top " + ranking.length +
        " participantes · Categoría de " + category + " segundos.";

}


// ==========================================
// 8. ABRIR Y CERRAR LEADERBOARD
// ==========================================

function openLeaderboard() {

    leaderboardCategory.value = String(duration);

    renderLeaderboard();

    leaderboardPanel.hidden = false;

    leaderboardButton.setAttribute("aria-expanded", "true");

    leaderboardPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


function hideLeaderboard() {

    leaderboardPanel.hidden = true;

    leaderboardButton.setAttribute("aria-expanded", "false");

}


leaderboardButton.addEventListener("click", function () {

    if (leaderboardPanel.hidden) {

        openLeaderboard();

    } else {

        hideLeaderboard();

    }

});


closeLeaderboard.addEventListener("click", hideLeaderboard);


leaderboardCategory.addEventListener("change", renderLeaderboard);


// ==========================================
// 9. SELECCIONAR DURACIÓN
// ==========================================

durationSelect.addEventListener("change", function () {

    if (gameActive || gameFinished) return;

    duration = Number(durationSelect.value);

    elapsedTime = 0;

    updateTimer(0);

});


// ==========================================
// 10. INICIAR PARTIDA
// ==========================================

startButton.addEventListener("click", function () {

    if (gameActive || gameFinished) return;

    // Validar nombre.
    currentPlayer = playerNameInput.value.trim();

    if (!currentPlayer) {

        message.classList.remove("success");

        message.textContent =
            "Por favor, escribe tu nombre antes de iniciar la partida.";

        playerNameInput.focus();

        return;

    }

    duration = Number(durationSelect.value);

    clicks = 0;
    elapsedTime = 0;

    updateCounter();
    updateTimer(0);

    gameActive = true;

    // Bloquear configuración durante la partida.
    playerNameInput.disabled = true;
    durationSelect.disabled = true;

    startButton.disabled = true;
    clickButton.disabled = false;

    message.classList.remove("success");

    message.textContent =
        "¡Partida en curso, " + currentPlayer +
        "! Haz tantos clicks como puedas.";

    // Iniciar cronómetro.
    startTime = performance.now();

    animationFrame = requestAnimationFrame(updateGame);

});


// ==========================================
// 11. MOTOR DEL CRONÓMETRO
// ==========================================

function updateGame(currentTime) {

    if (!gameActive) return;

    elapsedTime = currentTime - startTime;

    const totalDuration = duration * 1000;

    if (elapsedTime >= totalDuration) {

        elapsedTime = totalDuration;

        updateTimer(elapsedTime);

        finishGame();

        return;

    }

    updateTimer(elapsedTime);

    animationFrame = requestAnimationFrame(updateGame);

}


// ==========================================
// 12. REGISTRAR CLICKS
// ==========================================

clickButton.addEventListener("click", function () {

    if (!gameActive || gameFinished) return;

    // Evitar clicks después del tiempo límite.
    if (performance.now() - startTime >= duration * 1000) {

        finishGame();

        return;

    }

    clicks++;

    updateCounter();

});


// ==========================================
// 13. FINALIZAR PARTIDA
// ==========================================

function finishGame() {

    if (!gameActive) return;

    gameActive = false;
    gameFinished = true;

    if (animationFrame !== null) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

    // Bloquear controles.
    clickButton.disabled = true;

    startButton.disabled = true;

    durationSelect.disabled = true;

    playerNameInput.disabled = false;

    // Mostrar tiempo final.
    elapsedTime = duration * 1000;

    updateTimer(elapsedTime);

    timerProgress.style.width = "100%";

    // Registrar puntuación.
    const result = registerScore();

    message.classList.add("success");

    if (result.saved) {

        if (result.qualified) {

            message.textContent =
                "¡Tiempo terminado, " + currentPlayer +
                "! Lograste " + clicks +
                " clicks y ocupas la posición #" +
                result.position +
                " del ranking de " + duration +
                " segundos." +
                (result.isNewRecord ? " ¡Nuevo récord personal!" : "");

        } else {

            message.textContent =
                "¡Tiempo terminado, " + currentPlayer +
                "! Lograste " + clicks +
                " clicks. Esta puntuación no entra en el Top 10. ¡Inténtalo de nuevo!";

        }

    } else {

        message.textContent =
            "¡Partida terminada! Lograste " + clicks +
            " clicks. No se pudo guardar el resultado. Revisa el almacenamiento del navegador.";

    }

    // Actualizar y mostrar automáticamente el ranking.
    openLeaderboard();

}


// ==========================================
// 14. REINICIAR PARTIDA
// ==========================================

resetButton.addEventListener("click", function () {

    if (animationFrame !== null) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

    clicks = 0;

    elapsedTime = 0;

    startTime = 0;

    gameActive = false;

    gameFinished = false;

    duration = Number(durationSelect.value);

    updateCounter();

    updateTimer(0);

    timerProgress.style.width = "0%";

    // Habilitar configuración.
    durationSelect.disabled = false;

    playerNameInput.disabled = false;

    startButton.disabled = false;

    clickButton.disabled = true;

    message.classList.remove("success");

    message.textContent =
        "Partida reiniciada. Escribe tu nombre y prepárate para jugar.";

    // No borrar los récords al reiniciar una partida.
    hideLeaderboard();

});


// ==========================================
// 15. PERSONALIZAR TÍTULO
// ==========================================

titleInput.addEventListener("input", function () {

    const newTitle = titleInput.value.trim();

    eventTitle.textContent =
        newTitle || "Contador de Eventos";

});


// ==========================================
// 16. INICIALIZACIÓN
// ==========================================

duration = Number(durationSelect.value);

updateCounter();

updateTimer(0);

clickButton.disabled = true;

startButton.disabled = false;

renderLeaderboard();
