/* ==========================================================
   ADMIN SETTINGS
========================================================== */

const TOURNAMENT_MODE_KEY = "tournamentContentMode";
const TOURNAMENT_API_URL_KEY = "tournamentApiUrl";

function getSavedTournamentMode() {
    const mode = localStorage.getItem(TOURNAMENT_MODE_KEY);
    return mode === "api" ? "api" : "manual";
}

function setStatus(message) {
    const status = document.getElementById("adminStatus");
    if (!status) return;
    status.textContent = message;
}

function loadTournamentSettings() {
    const mode = getSavedTournamentMode();
    const apiUrl = localStorage.getItem(TOURNAMENT_API_URL_KEY) || "";

    const selectedInput = document.querySelector(
        `input[name="tournamentMode"][value="${mode}"]`
    );

    if (selectedInput) selectedInput.checked = true;

    const urlInput = document.getElementById("tournamentApiUrl");
    if (urlInput) {
        urlInput.value = apiUrl;
        urlInput.disabled = mode !== "api";
    }
}

function saveTournamentSettings() {
    const checked = document.querySelector("input[name='tournamentMode']:checked");
    const mode = checked ? checked.value : "manual";
    const urlInput = document.getElementById("tournamentApiUrl");
    const apiUrl = (urlInput?.value || "").trim();

    localStorage.setItem(TOURNAMENT_MODE_KEY, mode);

    if (apiUrl) {
        localStorage.setItem(TOURNAMENT_API_URL_KEY, apiUrl);
    } else {
        localStorage.removeItem(TOURNAMENT_API_URL_KEY);
    }

    setStatus(
        mode === "api"
            ? "Guardado: modo API activado."
            : "Guardado: modo manual activado."
    );
}

function bindTournamentSettings() {
    document.querySelectorAll("input[name='tournamentMode']").forEach((input) => {
        input.addEventListener("change", () => {
            const urlInput = document.getElementById("tournamentApiUrl");
            if (urlInput) urlInput.disabled = input.value !== "api" || !input.checked;
        });
    });

    const saveButton = document.getElementById("saveTournamentSettings");
    if (saveButton) {
        saveButton.addEventListener("click", saveTournamentSettings);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTournamentSettings();
    bindTournamentSettings();
});
