/* ==========================================================
   ADMIN SETTINGS
========================================================== */

const TOURNAMENT_MODE_KEY = "tournamentContentMode";
const TOURNAMENT_API_URL_KEY = "tournamentApiUrl";
const DRAW_BRACKET_KEY = "drawBracketState";
const LIVE_STREAM_URL_KEY = "liveStreamYoutubeUrl";
const LIVE_STREAM_HISTORY_KEY = "liveStreamYoutubeHistory";
const GALLERY_COLLECTION_KEY = "galleryCollections";
const NEWS_COLLECTION_KEY = "newsCollection";
const SPONSORS_COLLECTION_KEY = "sponsorsCollection";
const PLAYERS_COLLECTION_KEY = "playersCollection";
const TOURNAMENT_MANUAL_CONTENT_KEY = "tournamentManualContent";
const HERO_SETTINGS_KEY = "heroSettings";
const LANGS = ["es", "va", "en", "fr"];
const CLOUD_SYNC_KEYS = [
    TOURNAMENT_MODE_KEY,
    TOURNAMENT_API_URL_KEY,
    DRAW_BRACKET_KEY,
    LIVE_STREAM_URL_KEY,
    LIVE_STREAM_HISTORY_KEY,
    GALLERY_COLLECTION_KEY,
    NEWS_COLLECTION_KEY,
    SPONSORS_COLLECTION_KEY,
    PLAYERS_COLLECTION_KEY,
    TOURNAMENT_MANUAL_CONTENT_KEY,
    HERO_SETTINGS_KEY
];

let drawState = null;
let drawBaseState = null;
let pendingGalleryPhotos = [];
let galleryEditMode = false;
let pendingNewsImageSrc = "";
let newsEditMode = false;
let adminModulesStarted = false;
let pendingHeroBackgroundSrc = "";
let adminStartPromise = null;
let storageCloudPatchInstalled = false;
let adminSectionViewBound = false;
const ADMIN_DEFAULT_SECTION = String(window.ADMIN_DEFAULT_SECTION || "dashboard").trim() || "dashboard";
const ADMIN_MULTI_PAGE_MODE = window.ADMIN_MULTI_PAGE_MODE !== false;
const ADMIN_SECTION_IDS = [
    "tournament-mode-panel",
    "hero-admin-panel",
    "tournament-text-panel",
    "players-admin-panel",
    "sponsors-admin-panel",
    "live-settings-panel",
    "news-admin-panel",
    "gallery-admin-panel",
    "draw-schedule-panel",
    "draw-results-panel"
];
const ADMIN_SECTION_TO_PAGE = {
    dashboard: "admin-dashboard.html",
    "news-admin-panel": "admin-news.html",
    "live-settings-panel": "admin-streaming.html",
    "sponsors-admin-panel": "admin-sponsors.html",
    "gallery-admin-panel": "admin-gallery.html",
    "hero-admin-panel": "admin-hero.html",
    "tournament-mode-panel": "admin-tournament.html",
    "tournament-text-panel": "admin-tournament-text.html",
    "players-admin-panel": "admin-players.html",
    "draw-schedule-panel": "admin-draw-schedule.html",
    "draw-results-panel": "admin-draw-results.html"
};

function getSectionFromHash() {
    const raw = (window.location.hash || "").replace(/^#/, "").trim();
    if (!raw || raw === "dashboard") {
        if (ADMIN_DEFAULT_SECTION === "dashboard") return "dashboard";
        return ADMIN_SECTION_IDS.includes(ADMIN_DEFAULT_SECTION) ? ADMIN_DEFAULT_SECTION : "dashboard";
    }
    return ADMIN_SECTION_IDS.includes(raw) ? raw : "dashboard";
}

function updateAdminMenuActiveState(activeView) {
    const menuLinks = document.querySelectorAll(".sidebar nav a[data-section]");
    menuLinks.forEach((link) => {
        const target = String(link.getAttribute("data-section") || "dashboard").trim() || "dashboard";
        const isActive = (activeView === "dashboard" && target === "dashboard") || target === activeView;
        link.classList.toggle("is-active", isActive);
    });
}

function configureAdminMenuLinks() {
    const menuLinks = document.querySelectorAll(".sidebar nav a[data-section]");

    menuLinks.forEach((link) => {
        const section = String(link.getAttribute("data-section") || "dashboard").trim() || "dashboard";
        const targetPage = ADMIN_SECTION_TO_PAGE[section] || "admin-dashboard.html";

        if (ADMIN_MULTI_PAGE_MODE) {
            link.setAttribute("href", targetPage);
        } else {
            link.setAttribute("href", section === "dashboard" ? "#dashboard" : `#${section}`);
        }
    });
}

function showAdminSection(sectionId) {
    const dashboardIntro = document.getElementById("adminDashboardIntro");
    const allSections = document.querySelectorAll("main.content .admin-card");

    if (sectionId === "dashboard") {
        if (dashboardIntro) dashboardIntro.classList.remove("is-hidden");
        allSections.forEach((section) => {
            section.classList.remove("is-view-visible");
        });
        updateAdminMenuActiveState("dashboard");
        return;
    }

    if (dashboardIntro) dashboardIntro.classList.add("is-hidden");

    allSections.forEach((section) => {
        const shouldShow = section.id === sectionId;
        section.classList.toggle("is-view-visible", shouldShow);
    });

    updateAdminMenuActiveState(sectionId);
}

function applyAdminViewFromHash() {
    const section = getSectionFromHash();
    showAdminSection(section);
}

function bindAdminSectionView() {
    if (adminSectionViewBound) return;

    configureAdminMenuLinks();

    const menuLinks = document.querySelectorAll(".sidebar nav a[data-section]");

    if (ADMIN_MULTI_PAGE_MODE) {
        adminSectionViewBound = true;
        applyAdminViewFromHash();
        return;
    }

    menuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = String(link.getAttribute("href") || "").trim();
            if (!href.startsWith("#")) return;

            event.preventDefault();
            const target = href.replace(/^#/, "").trim() || "dashboard";
            const nextHash = target === "dashboard" ? "#dashboard" : `#${target}`;

            if (window.location.hash !== nextHash) {
                window.location.hash = nextHash;
            } else {
                applyAdminViewFromHash();
            }
        });
    });

    window.addEventListener("hashchange", applyAdminViewFromHash);
    adminSectionViewBound = true;
    applyAdminViewFromHash();
}

function installCloudStorageAutosync() {
    if (storageCloudPatchInstalled) return;

    const cloud = window.PSACloudStore;
    if (!cloud?.isReady?.()) return;

    const syncKeys = new Set(CLOUD_SYNC_KEYS);
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function patchedSetItem(key, value) {
        originalSetItem(key, value);

        if (syncKeys.has(key)) {
            cloud.saveLocalStorageKeyToCloud(key).catch(() => {
                // No interrumpimos UX de admin si la nube falla.
            });
        }
    };

    localStorage.removeItem = function patchedRemoveItem(key) {
        originalRemoveItem(key);

        if (syncKeys.has(key)) {
            cloud.removeLocalStorageKeyFromCloud(key).catch(() => {
                // No interrumpimos UX de admin si la nube falla.
            });
        }
    };

    storageCloudPatchInstalled = true;
}

async function hydrateAdminStateFromCloud() {
    const cloud = window.PSACloudStore;
    if (!cloud?.isReady?.()) return;

    await cloud.syncLocalStorageFromCloud(CLOUD_SYNC_KEYS);
}

function setAdminAuthStatus(message, isError = false) {
    const status = document.getElementById("adminAuthStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#ff8f8f" : "#93E4A2";
}

function showAdminApp() {
    const authSection = document.getElementById("admin-auth");
    const app = document.getElementById("adminApp");
    if (authSection) {
        authSection.hidden = true;
        authSection.style.display = "none";
    }
    if (app) {
        app.hidden = false;
        app.style.display = "grid";
    }
}

function showAuthScreen() {
    const authSection = document.getElementById("admin-auth");
    const app = document.getElementById("adminApp");
    if (authSection) {
        authSection.hidden = false;
        authSection.style.display = "grid";
    }
    if (app) {
        app.hidden = true;
        app.style.display = "none";
    }
}

async function startAdminModulesOnce() {
    if (adminModulesStarted) return;
    if (adminStartPromise) return adminStartPromise;

    adminStartPromise = (async () => {
        bindAdminSectionView();
        await hydrateAdminStateFromCloud();
        installCloudStorageAutosync();

        adminModulesStarted = true;
        loadTournamentSettings();
        bindTournamentSettings();
        initHeroAdmin();
        initTournamentManualAdmin();
        loadLiveSettings();
        bindLiveSettings();
        initPlayersAdmin();
        initSponsorsAdmin();
        initNewsAdmin();
        initGalleryAdmin();
        await initDrawAdmin();
    })();

    return adminStartPromise;
}

async function initAdminAuth() {
    const loginBtn = document.getElementById("adminLoginBtn");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const logoutBtn = document.getElementById("adminLogoutBtn");

    const supabaseClient = window.AdminSupabase?.getClient?.();

    if (!supabaseClient) {
        showAuthScreen();
        setAdminAuthStatus("Configura Supabase en supabase.js (URL y anon key).", true);
        return;
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = (emailInput?.value || "").trim();
            const password = passwordInput?.value || "";

            if (!email || !password) {
                setAdminAuthStatus("Introduce email y contraseña.", true);
                return;
            }

            loginBtn.disabled = true;
            setAdminAuthStatus("Verificando acceso...");

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            loginBtn.disabled = false;
            if (error) {
                setAdminAuthStatus(`No se pudo iniciar sesión: ${error.message}`, true);
                return;
            }

            setAdminAuthStatus("Acceso correcto.");

            // Abrir panel inmediatamente tras login correcto.
            if (data?.session) {
                showAdminApp();
                await startAdminModulesOnce();
                return;
            }

            // Fallback por si la sesión tarda en hidratarse en el cliente.
            const fallback = await supabaseClient.auth.getSession();
            if (fallback?.data?.session) {
                showAdminApp();
                await startAdminModulesOnce();
            } else {
                setAdminAuthStatus("Acceso correcto, pero no se pudo abrir el panel. Recarga la página.", true);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            const { error } = await supabaseClient.auth.signOut();
            if (!error) {
                window.location.href = "index.html";
                return;
            }

            setAdminAuthStatus(`No se pudo cerrar sesión: ${error.message}`, true);
        });
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            showAdminApp();
            await startAdminModulesOnce();
        } else {
            // Evita falsos negativos por eventos transitorios: verificamos sesión real.
            const fallback = await supabaseClient.auth.getSession();
            if (fallback?.data?.session) {
                showAdminApp();
                await startAdminModulesOnce();
                return;
            }

            showAuthScreen();
        }
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        showAuthScreen();
        setAdminAuthStatus(`Error de sesión: ${error.message}`, true);
        return;
    }

    if (data?.session) {
        showAdminApp();
        await startAdminModulesOnce();
    } else {
        showAuthScreen();
        setAdminAuthStatus("Inicia sesión para entrar al panel.");
    }
}

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

function updateLiveStatus(message) {
    const el = document.getElementById("liveAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function loadLiveSettings() {
    const titleInput = document.getElementById("liveStreamTitle");
    const input = document.getElementById("liveYoutubeUrl");
    if (!input) return;
    const history = readLiveHistory();
    const latest = history.length > 0 ? history[history.length - 1] : null;
    input.value = latest?.url || (localStorage.getItem(LIVE_STREAM_URL_KEY) || "");
    if (titleInput) {
        titleInput.value = latest?.title || "";
    }
    renderLiveHistoryInfo(history);
    renderLiveHistoryAdminList(history);
}

function renderLiveHistoryInfo(history = readLiveHistory()) {
    const info = document.getElementById("liveHistoryInfo");
    if (!info) return;

    if (!history.length) {
        info.textContent = "Historial de directos: 0";
        return;
    }

    info.textContent = `Historial de directos: ${history.length} (actual: 1, miniaturas: ${Math.max(0, history.length - 1)})`;
}

function persistLiveHistory(history) {
    const normalized = Array.isArray(history)
        ? history.filter((item) => item && typeof item === "object" && String(item.url || "").trim())
        : [];

    if (normalized.length === 0) {
        localStorage.removeItem(LIVE_STREAM_URL_KEY);
        localStorage.removeItem(LIVE_STREAM_HISTORY_KEY);
        return;
    }

    const latest = normalized[normalized.length - 1];
    localStorage.setItem(LIVE_STREAM_URL_KEY, String(latest.url || "").trim());
    localStorage.setItem(LIVE_STREAM_HISTORY_KEY, JSON.stringify(normalized));
}

function renderLiveHistoryAdminList(history = readLiveHistory()) {
    const host = document.getElementById("liveHistoryAdminList");
    if (!host) return;

    if (!history.length) {
        host.innerHTML = "";
        return;
    }

    host.innerHTML = history.map((item, index) => {
        const title = escapeHtml(item.title || `Directo ${index + 1}`);
        const url = escapeHtml(item.url || "");
        const badge = index === history.length - 1 ? " (actual)" : "";
        return `
            <div class="live-history-admin-item">
                <div class="live-history-admin-text">
                    <div class="live-history-admin-title">${title}${badge}</div>
                    <div class="live-history-admin-url">${url}</div>
                </div>
                <button type="button" class="btn-live-delete-one" data-live-remove-index="${index}">Borrar</button>
            </div>
        `;
    }).join("");

    host.querySelectorAll("[data-live-remove-index]").forEach((button) => {
        button.addEventListener("click", () => {
            const idx = Number(button.getAttribute("data-live-remove-index"));
            if (!Number.isInteger(idx) || idx < 0) return;

            const current = readLiveHistory();
            if (idx >= current.length) return;

            current.splice(idx, 1);
            persistLiveHistory(current);

            const titleInput = document.getElementById("liveStreamTitle");
            const urlInput = document.getElementById("liveYoutubeUrl");
            const latest = current.length ? current[current.length - 1] : null;

            if (titleInput) titleInput.value = latest?.title || "";
            if (urlInput) urlInput.value = latest?.url || "";

            renderLiveHistoryInfo(current);
            renderLiveHistoryAdminList(current);
            updateLiveStatus("Directo eliminado del historial.");
        });
    });
}

function readLiveHistory() {
    try {
        const raw = localStorage.getItem(LIVE_STREAM_HISTORY_KEY);
        const current = (localStorage.getItem(LIVE_STREAM_URL_KEY) || "").trim();

        if (!raw) {
            return current
                ? [{ url: current, title: "Directo", createdAt: new Date().toISOString() }]
                : [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return current
                ? [{ url: current, title: "Directo", createdAt: new Date().toISOString() }]
                : [];
        }

        const cleaned = parsed
            .map((item) => {
                if (typeof item === "string") {
                    const url = item.trim();
                    return url ? { url, title: "Directo", createdAt: new Date().toISOString() } : null;
                }

                if (item && typeof item === "object") {
                    const url = String(item.url || "").trim();
                    if (!url) return null;
                    return {
                        url,
                        title: String(item.title || "Directo").trim() || "Directo",
                        createdAt: item.createdAt || new Date().toISOString()
                    };
                }

                return null;
            })
            .filter(Boolean);

        if (cleaned.length === 0 && current) {
            return [{ url: current, title: "Directo", createdAt: new Date().toISOString() }];
        }

        return cleaned;
    } catch (error) {
        const current = (localStorage.getItem(LIVE_STREAM_URL_KEY) || "").trim();
        return current
            ? [{ url: current, title: "Directo", createdAt: new Date().toISOString() }]
            : [];
    }
}

async function fetchYouTubeTitle(videoUrl) {
    try {
        const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const response = await fetch(endpoint);
        if (!response.ok) return "";

        const payload = await response.json();
        return String(payload?.title || "").trim();
    } catch (error) {
        return "";
    }
}

function extractYouTubeVideoId(url) {
    if (!url) return "";

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

        if (host === "youtu.be") {
            return parsed.pathname.split("/").filter(Boolean)[0] || "";
        }

        if (host.endsWith("youtube.com")) {
            if (parsed.searchParams.get("v")) {
                return parsed.searchParams.get("v") || "";
            }

            const pathParts = parsed.pathname.split("/").filter(Boolean);
            const marker = pathParts[0];
            if (["embed", "shorts", "live"].includes(marker) && pathParts[1]) {
                return pathParts[1];
            }
        }
    } catch (error) {
        return "";
    }

    return "";
}

async function saveLiveSettings() {
    const titleInput = document.getElementById("liveStreamTitle");
    const input = document.getElementById("liveYoutubeUrl");
    if (!input) return;

    const value = (input.value || "").trim();

    if (!value) {
        localStorage.removeItem(LIVE_STREAM_URL_KEY);
        localStorage.removeItem(LIVE_STREAM_HISTORY_KEY);
        updateLiveStatus("Enlace eliminado. Se mostrara el placeholder en LIVE.");
        return;
    }

    const isYouTubeLink = /(?:youtube\.com|youtu\.be)/i.test(value);
    if (!isYouTubeLink) {
        updateLiveStatus("URL no valida: usa un enlace de YouTube.");
        return;
    }

    const fetchedTitle = await fetchYouTubeTitle(value);
    const videoId = extractYouTubeVideoId(value);
    const title = fetchedTitle || (videoId ? `Directo ${videoId}` : "Directo");
    if (titleInput) titleInput.value = title;

    const history = readLiveHistory();
    const last = history[history.length - 1] || null;
    if (!last || value !== last.url) {
        history.push({
            url: value,
            title,
            createdAt: new Date().toISOString()
        });
    } else {
        last.title = title;
    }

    persistLiveHistory(history);
    updateLiveStatus(`Enlace guardado. Historial de directos: ${history.length}.`);
    renderLiveHistoryInfo(history);
    renderLiveHistoryAdminList(history);
}

function bindLiveSettings() {
    const saveButton = document.getElementById("saveLiveSettings");
    const clearButton = document.getElementById("clearLiveHistory");

    if (saveButton) {
        saveButton.addEventListener("click", saveLiveSettings);
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            localStorage.removeItem(LIVE_STREAM_URL_KEY);
            localStorage.removeItem(LIVE_STREAM_HISTORY_KEY);

            const titleInput = document.getElementById("liveStreamTitle");
            const input = document.getElementById("liveYoutubeUrl");
            if (titleInput) titleInput.value = "";
            if (input) input.value = "";

            updateLiveStatus("Directo e historial borrados. Ya puedes hacer pruebas desde cero.");
            renderLiveHistoryInfo([]);
            renderLiveHistoryAdminList([]);
        });
    }
}

function updateGalleryStatus(message) {
    const el = document.getElementById("galleryAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function updateNewsStatus(message) {
    const el = document.getElementById("newsAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeLocalizedText(value) {
    if (value && typeof value === "object") {
        const base = value.es || value.va || value.en || value.fr || "";
        return {
            es: String(value.es ?? base),
            va: String(value.va ?? base),
            en: String(value.en ?? base),
            fr: String(value.fr ?? base)
        };
    }

    const text = String(value || "");
    return { es: text, va: text, en: text, fr: text };
}

function localizedInputValue(prefix, lang) {
    const input = document.getElementById(`${prefix}_${lang}`);
    return (input?.value || "").trim();
}

function getLocalizedFromInputs(prefix) {
    return {
        es: localizedInputValue(prefix, "es"),
        va: localizedInputValue(prefix, "va"),
        en: localizedInputValue(prefix, "en"),
        fr: localizedInputValue(prefix, "fr")
    };
}

function clearLocalizedInputs(prefix) {
    LANGS.forEach((lang) => {
        const input = document.getElementById(`${prefix}_${lang}`);
        if (input) input.value = "";
    });
}

function hasAllLanguages(localizedMap) {
    return LANGS.every((lang) => String(localizedMap?.[lang] || "").trim().length > 0);
}

async function translateFromSpanish(text, targetLang) {
    const source = String(text || "").trim();
    if (!source) return "";
    if (targetLang === "es") return source;

    const langMap = { va: "ca", en: "en", fr: "fr" };
    const target = langMap[targetLang] || targetLang;

    try {
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(source)}`;
        const googleResponse = await fetch(googleUrl, { cache: "no-store" });
        if (googleResponse.ok) {
            const payload = await googleResponse.json();
            const translated = Array.isArray(payload?.[0])
                ? payload[0].map((part) => String(part?.[0] || "")).join("").trim()
                : "";
            if (translated) return translated;
        }
    } catch (error) {
        // Intentamos fallback si este proveedor falla.
    }

    try {
        const memoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=es|${encodeURIComponent(target)}`;
        const memoryResponse = await fetch(memoryUrl, { cache: "no-store" });
        if (!memoryResponse.ok) return source;

        const payload = await memoryResponse.json();
        const translated = decodeHtmlEntities(String(payload?.responseData?.translatedText || "").trim());
        return translated || source;
    } catch (error) {
        return source;
    }
}

function decodeHtmlEntities(value) {
    const parser = document.createElement("textarea");
    parser.innerHTML = String(value || "");
    return parser.value;
}

async function buildLocalizedFromSpanish(sourceText) {
    const es = String(sourceText || "").trim();
    if (!es) {
        return { es: "", va: "", en: "", fr: "" };
    }

    const [va, en, fr] = await Promise.all([
        translateFromSpanish(es, "va"),
        translateFromSpanish(es, "en"),
        translateFromSpanish(es, "fr")
    ]);

    return { es, va, en, fr };
}

function updateTournamentManualStatus(message) {
    const el = document.getElementById("tournamentManualStatus");
    if (!el) return;
    el.textContent = message;
}

function readTournamentManualContent() {
    try {
        const raw = localStorage.getItem(TOURNAMENT_MANUAL_CONTENT_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;

        return {
            title: normalizeLocalizedText(parsed.title),
            body: normalizeLocalizedText(parsed.body),
            updatedAt: parsed.updatedAt || new Date().toISOString()
        };
    } catch (error) {
        return null;
    }
}

function fillTournamentManualInputs() {
    const saved = readTournamentManualContent();
    const titleInput = document.getElementById("tournamentManualTitle_es");
    const bodyInput = document.getElementById("tournamentManualBody_es");
    if (!titleInput || !bodyInput) return;

    titleInput.value = saved?.title?.es || "";
    bodyInput.value = saved?.body?.es || "";
}

async function saveTournamentManualContent() {
    const titleEs = (document.getElementById("tournamentManualTitle_es")?.value || "").trim();
    const bodyEs = (document.getElementById("tournamentManualBody_es")?.value || "").trim();

    if (!titleEs || !bodyEs) {
        updateTournamentManualStatus("Escribe título y texto en español.");
        return;
    }

    updateTournamentManualStatus("Traduciendo contenido...");
    const [title, body] = await Promise.all([
        buildLocalizedFromSpanish(titleEs),
        buildLocalizedFromSpanish(bodyEs)
    ]);

    const payload = {
        title,
        body,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(TOURNAMENT_MANUAL_CONTENT_KEY, JSON.stringify(payload));
    updateTournamentManualStatus("Contenido del torneo guardado y traducido.");
}

function resetTournamentManualContent() {
    localStorage.removeItem(TOURNAMENT_MANUAL_CONTENT_KEY);
    fillTournamentManualInputs();
    updateTournamentManualStatus("Contenido manual eliminado. Se usará el texto base de la web.");
}

function initTournamentManualAdmin() {
    const panel = document.getElementById("tournament-text-panel");
    if (!panel) return;

    const saveButton = document.getElementById("saveTournamentManualContent");
    const resetButton = document.getElementById("resetTournamentManualContent");

    if (saveButton) {
        saveButton.addEventListener("click", saveTournamentManualContent);
    }
    if (resetButton) {
        resetButton.addEventListener("click", resetTournamentManualContent);

    function updateHeroStatus(message) {
        const el = document.getElementById("heroAdminStatus");
        if (!el) return;
        el.textContent = message;
    }

    function normalizeHeroSettings(payload) {
        if (!payload || typeof payload !== "object") return null;

        return {
            eventLabel: normalizeLocalizedText(payload.eventLabel),
            eventTitle: normalizeLocalizedText(payload.eventTitle),
            eventLocation: normalizeLocalizedText(payload.eventLocation),
            countdownDate: String(payload.countdownDate || "").trim(),
            backgroundImage: String(payload.backgroundImage || "").trim(),
            updatedAt: payload.updatedAt || new Date().toISOString()
        };
    }

    function readHeroSettings() {
        try {
            const raw = localStorage.getItem(HERO_SETTINGS_KEY);
            if (!raw) return null;
            return normalizeHeroSettings(JSON.parse(raw));
        } catch (error) {
            return null;
        }
    }

    function toDateTimeLocalInputValue(value) {
        const dt = new Date(value || "");
        if (Number.isNaN(dt.getTime())) return "";
        const pad = (num) => String(num).padStart(2, "0");
        const yyyy = dt.getFullYear();
        const mm = pad(dt.getMonth() + 1);
        const dd = pad(dt.getDate());
        const hh = pad(dt.getHours());
        const mi = pad(dt.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

    function fromDateTimeLocalInputValue(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime())) return "";
        return dt.toISOString();
    }

    function fillHeroInputs() {
        const saved = readHeroSettings();

        const labelInput = document.getElementById("heroEventLabel_es");
        const titleInput = document.getElementById("heroEventTitle_es");
        const locationInput = document.getElementById("heroEventLocation_es");
        const countdownInput = document.getElementById("heroCountdownDate");
        const bgPathInput = document.getElementById("heroBackgroundPath");

        if (labelInput) labelInput.value = saved?.eventLabel?.es || "";
        if (titleInput) titleInput.value = saved?.eventTitle?.es || "";
        if (locationInput) locationInput.value = saved?.eventLocation?.es || "";
        if (countdownInput) countdownInput.value = toDateTimeLocalInputValue(saved?.countdownDate || "");
        if (bgPathInput) bgPathInput.value = saved?.backgroundImage || "";
    }

    async function onHeroBackgroundChange(event) {
        const file = event.target.files?.[0];
        if (!file) {
            pendingHeroBackgroundSrc = "";
            return;
        }

        pendingHeroBackgroundSrc = await readFileAsDataUrl(file);
    }

    async function saveHeroSettings() {
        const labelEs = (document.getElementById("heroEventLabel_es")?.value || "").trim();
        const titleEs = (document.getElementById("heroEventTitle_es")?.value || "").trim();
        const locationEs = (document.getElementById("heroEventLocation_es")?.value || "").trim();
        const countdownRaw = (document.getElementById("heroCountdownDate")?.value || "").trim();
        const bgPath = (document.getElementById("heroBackgroundPath")?.value || "").trim();

        if (!labelEs || !titleEs || !locationEs) {
            updateHeroStatus("Etiqueta, título y ubicación en español son obligatorios.");
            return;
        }

        updateHeroStatus("Traduciendo textos del hero...");

        const [eventLabel, eventTitle, eventLocation] = await Promise.all([
            buildLocalizedFromSpanish(labelEs),
            buildLocalizedFromSpanish(titleEs),
            buildLocalizedFromSpanish(locationEs)
        ]);

        const countdownDate = fromDateTimeLocalInputValue(countdownRaw);
        const backgroundImage = pendingHeroBackgroundSrc || bgPath;

        const payload = {
            eventLabel,
            eventTitle,
            eventLocation,
            countdownDate,
            backgroundImage,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(HERO_SETTINGS_KEY, JSON.stringify(payload));
        pendingHeroBackgroundSrc = "";
        const fileInput = document.getElementById("heroBackgroundFile");
        if (fileInput) fileInput.value = "";

        updateHeroStatus("Hero guardado y traducido para todos los idiomas.");
    }

    function resetHeroSettings() {
        localStorage.removeItem(HERO_SETTINGS_KEY);
        pendingHeroBackgroundSrc = "";
        fillHeroInputs();

        const fileInput = document.getElementById("heroBackgroundFile");
        if (fileInput) fileInput.value = "";

        updateHeroStatus("Hero restaurado a la configuración base.");
    }

    function initHeroAdmin() {
        const panel = document.getElementById("hero-admin-panel");
        if (!panel) return;

        const saveButton = document.getElementById("saveHeroSettings");
        const resetButton = document.getElementById("resetHeroSettings");
        const bgFileInput = document.getElementById("heroBackgroundFile");

        if (saveButton) {
            saveButton.addEventListener("click", saveHeroSettings);
        }
        if (resetButton) {
            resetButton.addEventListener("click", resetHeroSettings);
        }
        if (bgFileInput) {
            bgFileInput.addEventListener("change", onHeroBackgroundChange);
        }

        fillHeroInputs();
    }
    }

    fillTournamentManualInputs();
}

function normalizeGallery(gallery) {
    const photos = Array.isArray(gallery?.photos) ? gallery.photos : [];
    return {
        id: gallery?.id || createId("gallery"),
        title: normalizeLocalizedText(gallery?.title),
        photos: photos.map((photo) => ({
            id: photo?.id || createId("photo"),
            src: photo?.src || "",
            caption: normalizeLocalizedText(photo?.caption)
        })).filter((photo) => !!photo.src),
        createdAt: gallery?.createdAt || new Date().toISOString()
    };
}

function normalizeNewsItem(item) {
    const legacyArticle = item?.article || item?.summary || "";
    return {
        id: item?.id || createId("news"),
        imageSrc: item?.imageSrc || item?.image || "",
        title: normalizeLocalizedText(item?.title),
        article: normalizeLocalizedText(legacyArticle),
        createdAt: item?.createdAt || new Date().toISOString()
    };
}

function readGalleryCollection() {
    try {
        const raw = localStorage.getItem(GALLERY_COLLECTION_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.map(normalizeGallery).sort((a, b) => {
            const ta = Date.parse(a?.createdAt || "") || 0;
            const tb = Date.parse(b?.createdAt || "") || 0;
            return ta - tb;
        });
    } catch (error) {
        return [];
    }
}

function saveGalleryCollection(collection) {
    try {
        localStorage.setItem(GALLERY_COLLECTION_KEY, JSON.stringify(collection));
        return true;
    } catch (error) {
        return false;
    }
}

function readNewsCollection() {
    try {
        const raw = localStorage.getItem(NEWS_COLLECTION_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map(normalizeNewsItem).sort((a, b) => {
                    const ta = Date.parse(a?.createdAt || "") || 0;
                    const tb = Date.parse(b?.createdAt || "") || 0;
                    return tb - ta;
                });
            }
        }
    } catch (error) {
        return [];
    }

    return [];
}

function saveNewsCollection(collection) {
    try {
        localStorage.setItem(NEWS_COLLECTION_KEY, JSON.stringify(collection));
        return true;
    } catch (error) {
        return false;
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer una imagen."));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("No se pudo procesar una imagen."));
        img.src = dataUrl;
    });
}

async function readFileAsDataUrl(file) {
    const originalDataUrl = await fileToDataUrl(file);
    const image = await loadImage(originalDataUrl);

    const maxWidth = 1600;
    const scale = image.width > maxWidth ? maxWidth / image.width : 1;
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return originalDataUrl;

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", 0.82);
}

function renderPendingGalleryPhotos() {
    const host = document.getElementById("newGalleryPhotosEditor");
    if (!host) return;

    if (pendingGalleryPhotos.length === 0) {
        host.innerHTML = "";
        return;
    }

    host.innerHTML = pendingGalleryPhotos.map((photo, i) => `
        <div class="gallery-new-photo-item">
            <img class="gallery-thumb" src="${photo.src}" alt="Nueva foto ${i + 1}">
            ${LANGS.map((lang) => `
                <label class="field-label" for="pendingCaption_${i}_${lang}">Pie ${lang.toUpperCase()}</label>
                <input id="pendingCaption_${i}_${lang}" type="text" value="${escapeHtml(photo.caption?.[lang] || "")}" placeholder="Texto ${lang.toUpperCase()}">
            `).join("")}
            <label class="gallery-cover-check" for="pendingCover_${i}">
                <input id="pendingCover_${i}" type="radio" name="pendingCover" value="${i}" ${i === 0 ? "checked" : ""}>
                Imagen de portada
            </label>
        </div>
    `).join("");

    pendingGalleryPhotos.forEach((_, i) => {
        LANGS.forEach((lang) => {
            const input = document.getElementById(`pendingCaption_${i}_${lang}`);
            if (!input) return;
            input.addEventListener("input", () => {
                pendingGalleryPhotos[i].caption[lang] = input.value;
            });
        });
    });

    host.querySelectorAll("input[name='pendingCover']").forEach((input) => {
        input.addEventListener("change", () => {
            const index = Number(input.value);
            if (!Number.isInteger(index) || index < 0 || index >= pendingGalleryPhotos.length) return;
            if (index === 0) return;

            const selected = pendingGalleryPhotos[index];
            pendingGalleryPhotos.splice(index, 1);
            pendingGalleryPhotos.unshift(selected);

            renderPendingGalleryPhotos();
            updateGalleryStatus("Portada seleccionada para la nueva galería.");
        });
    });
}

async function onNewGalleryFilesChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const additions = await Promise.all(files.map(async (file) => ({
        id: createId("photo"),
        src: await readFileAsDataUrl(file),
        caption: normalizeLocalizedText(file.name.replace(/\.[^.]+$/, ""))
    })));

    pendingGalleryPhotos = pendingGalleryPhotos.concat(additions);
    renderPendingGalleryPhotos();
    event.target.value = "";
}

function getGalleryById(collection, galleryId) {
    return collection.find((item) => item.id === galleryId);
}

function renderGalleryAdminList() {
    const host = document.getElementById("galleryAdminList");
    if (!host) return;

    const galleries = readGalleryCollection();
    if (galleries.length === 0) {
        host.innerHTML = '<p class="admin-muted">No hay galerías todavía.</p>';
        return;
    }

    host.innerHTML = galleries.map((gallery) => {
        const photos = Array.isArray(gallery.photos) ? gallery.photos : [];
        const photosMarkup = photos.map((photo, photoIndex) => `
            <div class="gallery-photo-item" data-photo-item="${photo.id}">
                <img class="gallery-thumb" src="${photo.src}" alt="${escapeHtml(photo.caption?.es || "Foto")}">
                ${LANGS.map((lang) => `
                    <label class="field-label" for="caption_${photo.id}_${lang}">Pie ${lang.toUpperCase()}</label>
                    <input id="caption_${photo.id}_${lang}" type="text" value="${escapeHtml(photo.caption?.[lang] || "")}">
                `).join("")}
                <label class="gallery-cover-check" for="cover_${gallery.id}_${photo.id}">
                    <input id="cover_${gallery.id}_${photo.id}" type="radio" name="cover_${gallery.id}" value="${photo.id}" ${photoIndex === 0 ? "checked" : ""} data-action="set-cover" data-gallery-id="${gallery.id}" data-photo-id="${photo.id}">
                    Imagen de portada
                </label>
                <label class="field-label" for="replace_${photo.id}">Reemplazar imagen (opcional)</label>
                <input id="replace_${photo.id}" type="file" accept="image/*">
                <div class="gallery-photo-actions">
                    <button type="button" class="btn-gallery-save" data-action="save-photo" data-gallery-id="${gallery.id}" data-photo-id="${photo.id}">Guardar foto</button>
                    <button type="button" class="btn-gallery-danger" data-action="delete-photo" data-gallery-id="${gallery.id}" data-photo-id="${photo.id}">Borrar foto</button>
                </div>
            </div>
        `).join("");

        return `
            <article class="gallery-admin-card" data-gallery-id="${gallery.id}">
                <div class="gallery-admin-head">
                    ${LANGS.map((lang) => `<input type="text" id="galleryTitle_${gallery.id}_${lang}" value="${escapeHtml(gallery.title?.[lang] || "")}" placeholder="Título ${lang.toUpperCase()}">`).join("")}
                    <button type="button" class="btn-gallery-save" data-action="save-title" data-gallery-id="${gallery.id}">Guardar título</button>
                </div>
                <div class="gallery-admin-actions">
                    <input type="file" id="appendFiles_${gallery.id}" accept="image/*" multiple>
                    <button type="button" class="btn-gallery-add" data-action="append-photos" data-gallery-id="${gallery.id}">Añadir fotos</button>
                </div>
                <div class="gallery-photo-grid">${photosMarkup || '<p class="admin-muted">Sin fotos.</p>'}</div>
            </article>
        `;
    }).join("");

    host.querySelectorAll("[data-action='save-title']").forEach((button) => {
        button.addEventListener("click", async () => {
            const galleryId = button.getAttribute("data-gallery-id");
            const galleriesInner = readGalleryCollection();
            const gallery = getGalleryById(galleriesInner, galleryId);
            if (!gallery) return;

            const sourceInput = document.getElementById(`galleryTitle_${galleryId}_es`);
            const sourceEs = (sourceInput?.value || "").trim();
            if (!sourceEs) {
                updateGalleryStatus("Escribe el título en español para traducir automáticamente.");
                return;
            }

            const newTitle = await buildLocalizedFromSpanish(sourceEs);
            gallery.title = newTitle;
            const saved = saveGalleryCollection(galleriesInner);
            if (!saved) {
                updateGalleryStatus("No se pudo guardar el título de la galería.");
                return;
            }
            updateGalleryStatus("Título de galería actualizado.");
            renderGalleryDeleteSelect();
            renderGalleryAdminList();
        });
    });

    host.querySelectorAll("[data-action='append-photos']").forEach((button) => {
        button.addEventListener("click", async () => {
            const galleryId = button.getAttribute("data-gallery-id");
            const fileInput = document.getElementById(`appendFiles_${galleryId}`);
            const files = Array.from(fileInput?.files || []);
            if (files.length === 0) {
                updateGalleryStatus("Selecciona fotos para añadir.");
                return;
            }

            const galleriesInner = readGalleryCollection();
            const gallery = getGalleryById(galleriesInner, galleryId);
            if (!gallery) return;

            const newPhotos = await Promise.all(files.map(async (file) => ({
                id: createId("photo"),
                src: await readFileAsDataUrl(file),
                caption: normalizeLocalizedText(file.name.replace(/\.[^.]+$/, ""))
            })));

            if (!Array.isArray(gallery.photos)) {
                gallery.photos = [];
            }

            gallery.photos = gallery.photos.concat(newPhotos);
            const saved = saveGalleryCollection(galleriesInner);
            if (!saved) {
                updateGalleryStatus("No se pudo guardar: almacenamiento lleno. Reduce el número o tamaño de fotos.");
                return;
            }
            updateGalleryStatus("Fotos añadidas a la galería.");
            renderGalleryAdminList();
            renderGalleryDeleteSelect();
        });
    });

    host.querySelectorAll("[data-action='save-photo']").forEach((button) => {
        button.addEventListener("click", async () => {
            const galleryId = button.getAttribute("data-gallery-id");
            const photoId = button.getAttribute("data-photo-id");
            const galleriesInner = readGalleryCollection();
            const gallery = getGalleryById(galleriesInner, galleryId);
            if (!gallery || !Array.isArray(gallery.photos)) return;

            const photo = gallery.photos.find((item) => item.id === photoId);
            if (!photo) return;

            const captionInputEs = document.getElementById(`caption_${photoId}_es`);
            const captionEs = (captionInputEs?.value || "").trim();
            if (!captionEs) {
                updateGalleryStatus("Escribe el pie de foto en español para traducir automáticamente.");
                return;
            }
            photo.caption = await buildLocalizedFromSpanish(captionEs);

            const replaceInput = document.getElementById(`replace_${photoId}`);
            const replacement = replaceInput?.files?.[0];
            if (replacement) {
                photo.src = await readFileAsDataUrl(replacement);
            }

            const saved = saveGalleryCollection(galleriesInner);
            if (!saved) {
                updateGalleryStatus("No se pudo guardar: almacenamiento lleno. Reduce el número o tamaño de fotos.");
                return;
            }
            updateGalleryStatus("Foto actualizada.");
            renderGalleryAdminList();
        });
    });

    host.querySelectorAll("[data-action='delete-photo']").forEach((button) => {
        button.addEventListener("click", () => {
            const galleryId = button.getAttribute("data-gallery-id");
            const photoId = button.getAttribute("data-photo-id");
            const galleriesInner = readGalleryCollection();
            const gallery = getGalleryById(galleriesInner, galleryId);
            if (!gallery || !Array.isArray(gallery.photos)) return;

            gallery.photos = gallery.photos.filter((photo) => photo.id !== photoId);
            const saved = saveGalleryCollection(galleriesInner);
            if (!saved) {
                updateGalleryStatus("No se pudo guardar cambios en la galería.");
                return;
            }
            updateGalleryStatus("Foto eliminada.");
            renderGalleryAdminList();
        });
    });

    host.querySelectorAll("input[data-action='set-cover']").forEach((input) => {
        input.addEventListener("change", () => {
            const galleryId = input.getAttribute("data-gallery-id");
            const photoId = input.getAttribute("data-photo-id");
            const galleriesInner = readGalleryCollection();
            const gallery = getGalleryById(galleriesInner, galleryId);
            if (!gallery || !Array.isArray(gallery.photos)) return;

            const index = gallery.photos.findIndex((photo) => photo.id === photoId);
            if (index <= 0) return;

            const [selected] = gallery.photos.splice(index, 1);
            gallery.photos.unshift(selected);

            const saved = saveGalleryCollection(galleriesInner);
            if (!saved) {
                updateGalleryStatus("No se pudo guardar cambios en la portada.");
                return;
            }
            updateGalleryStatus("Foto de portada actualizada.");
            renderGalleryAdminList();
        });
    });
}

function renderGalleryDeleteSelect() {
    const select = document.getElementById("galleryDeleteSelect");
    if (!select) return;

    const galleries = readGalleryCollection();
    if (galleries.length === 0) {
        select.innerHTML = '<option value="">No hay galerías</option>';
        return;
    }

    select.innerHTML = galleries
        .map((gallery) => `<option value="${gallery.id}">${escapeHtml(gallery.title?.es || "Galería")}</option>`)
        .join("");
}

function deleteSelectedGallery() {
    const select = document.getElementById("galleryDeleteSelect");
    const galleryId = select?.value || "";

    if (!galleryId) {
        updateGalleryStatus("Selecciona una galería para borrar.");
        return;
    }

    const galleries = readGalleryCollection().filter((item) => item.id !== galleryId);
    const saved = saveGalleryCollection(galleries);
    if (!saved) {
        updateGalleryStatus("No se pudo guardar la galería: almacenamiento lleno. Prueba con menos fotos o más pequeñas.");
        return;
    }

    renderGalleryDeleteSelect();
    renderGalleryAdminList();
    updateGalleryStatus("Galería eliminada.");
}

function toggleGalleryEditMode() {
    const editor = document.getElementById("galleryAdminEditor");
    const button = document.getElementById("toggleGalleryEditMode");
    if (!editor || !button) return;

    galleryEditMode = !galleryEditMode;
    editor.classList.toggle("is-hidden", !galleryEditMode);
    button.textContent = galleryEditMode ? "Cerrar editor" : "Editar galerías";
}

async function saveNewGallery() {
    const title = getLocalizedFromInputs("newGalleryTitle");

    if (!String(title.es || "").trim()) {
        updateGalleryStatus("Escribe el título de galería en español.");
        return;
    }

    if (pendingGalleryPhotos.length === 0) {
        updateGalleryStatus("Sube al menos una foto.");
        return;
    }

    const galleries = readGalleryCollection();
    const localizedTitle = await buildLocalizedFromSpanish(title.es);

    const localizedPhotos = await Promise.all(pendingGalleryPhotos.map(async (photo) => ({
        id: createId("photo"),
        src: photo.src,
        caption: await buildLocalizedFromSpanish(photo.caption?.es || "")
    })));

    galleries.push({
        id: createId("gallery"),
        title: localizedTitle,
        photos: localizedPhotos,
        createdAt: new Date().toISOString()
    });

    const saved = saveGalleryCollection(galleries);
    if (!saved) {
        updateGalleryStatus("No se pudo guardar la galería: almacenamiento lleno. Prueba con menos fotos o más pequeñas.");
        return;
    }

    pendingGalleryPhotos = [];
    clearLocalizedInputs("newGalleryTitle");
    renderPendingGalleryPhotos();
    renderGalleryDeleteSelect();
    renderGalleryAdminList();
    updateGalleryStatus("Galería guardada correctamente.");

    window.location.href = "index.html#gallery";
}

function renderNewsDeleteSelect() {
    const select = document.getElementById("newsDeleteSelect");
    if (!select) return;

    const newsItems = readNewsCollection();
    if (newsItems.length === 0) {
        select.innerHTML = '<option value="">No hay noticias</option>';
        return;
    }

    select.innerHTML = newsItems
        .map((item) => `<option value="${item.id}">${escapeHtml(item.title?.es || "Noticia")}</option>`)
        .join("");
}

function deleteSelectedNews() {
    const select = document.getElementById("newsDeleteSelect");
    const newsId = select?.value || "";
    if (!newsId) {
        updateNewsStatus("Selecciona una noticia para borrar.");
        return;
    }

    const nextCollection = readNewsCollection().filter((item) => item.id !== newsId);
    const saved = saveNewsCollection(nextCollection);
    if (!saved) {
        updateNewsStatus("No se pudo borrar la noticia.");
        return;
    }

    renderNewsDeleteSelect();
    renderNewsAdminList();
    updateNewsStatus("Noticia eliminada.");
}

function toggleNewsEditMode() {
    const editor = document.getElementById("newsAdminEditor");
    const button = document.getElementById("toggleNewsEditMode");
    if (!editor || !button) return;

    newsEditMode = !newsEditMode;
    editor.classList.toggle("is-hidden", !newsEditMode);
    button.textContent = newsEditMode ? "Cerrar editor" : "Editar noticias";
}

function renderNewsAdminList() {
    const host = document.getElementById("newsAdminList");
    if (!host) return;

    const newsItems = readNewsCollection();
    if (newsItems.length === 0) {
        host.innerHTML = '<p class="admin-muted">No hay noticias todavía.</p>';
        return;
    }

    host.innerHTML = newsItems.map((item) => `
        <article class="gallery-admin-card" data-news-id="${item.id}">
            <img class="gallery-thumb" src="${item.imageSrc}" alt="${escapeHtml(item.title?.es || "Noticia")}">
            <label class="field-label" for="newsReplaceImage_${item.id}">Reemplazar imagen</label>
            <input id="newsReplaceImage_${item.id}" class="news-replace-image" type="file" accept="image/*">
            ${LANGS.map((lang) => `
                <label class="field-label" for="newsTitle_${item.id}_${lang}">Título ${lang.toUpperCase()}</label>
                <input id="newsTitle_${item.id}_${lang}" type="text" value="${escapeHtml(item.title?.[lang] || "")}">
                <label class="field-label" for="newsArticle_${item.id}_${lang}">Artículo ${lang.toUpperCase()}</label>
                <textarea id="newsArticle_${item.id}_${lang}" rows="5">${escapeHtml(item.article?.[lang] || "")}</textarea>
            `).join("")}
            <div class="gallery-photo-actions">
                <button type="button" class="btn-gallery-save" data-action="save-news" data-news-id="${item.id}">Guardar noticia</button>
            </div>
        </article>
    `).join("");

    host.querySelectorAll("[data-action='save-news']").forEach((button) => {
        button.addEventListener("click", async () => {
            const newsId = button.getAttribute("data-news-id");
            const collection = readNewsCollection();
            const item = collection.find((entry) => entry.id === newsId);
            if (!item) return;

            const titleEs = (document.getElementById(`newsTitle_${newsId}_es`)?.value || "").trim();
            const articleEs = (document.getElementById(`newsArticle_${newsId}_es`)?.value || "").trim();

            if (!titleEs || !articleEs) {
                updateNewsStatus("Escribe título y artículo en español para traducir automáticamente.");
                return;
            }

            const title = await buildLocalizedFromSpanish(titleEs);
            const article = await buildLocalizedFromSpanish(articleEs);

            const imageInput = document.getElementById(`newsReplaceImage_${newsId}`);
            const replacement = imageInput?.files?.[0];
            if (replacement) {
                item.imageSrc = await readFileAsDataUrl(replacement);
            }

            item.title = title;
            item.article = article;

            const saved = saveNewsCollection(collection);
            if (!saved) {
                updateNewsStatus("No se pudo guardar la noticia.");
                return;
            }

            updateNewsStatus("Noticia actualizada.");
            renderNewsDeleteSelect();
            renderNewsAdminList();
        });
    });
}

async function onNewNewsImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
        pendingNewsImageSrc = "";
        return;
    }

    pendingNewsImageSrc = await readFileAsDataUrl(file);
}

async function saveNewNews() {
    const title = getLocalizedFromInputs("newNewsTitle");
    const article = getLocalizedFromInputs("newNewsArticle");

    if (!String(title.es || "").trim() || !String(article.es || "").trim()) {
        updateNewsStatus("Escribe título y artículo en español.");
        return;
    }

    if (!pendingNewsImageSrc) {
        updateNewsStatus("Sube una foto para la noticia.");
        return;
    }

    const collection = readNewsCollection();

    const localizedTitle = await buildLocalizedFromSpanish(title.es);
    const localizedArticle = await buildLocalizedFromSpanish(article.es);

    collection.unshift({
        id: createId("news"),
        imageSrc: pendingNewsImageSrc,
        title: localizedTitle,
        article: localizedArticle,
        createdAt: new Date().toISOString()
    });

    const saved = saveNewsCollection(collection);
    if (!saved) {
        updateNewsStatus("No se pudo guardar la noticia: almacenamiento lleno.");
        return;
    }

    clearLocalizedInputs("newNewsTitle");
    clearLocalizedInputs("newNewsArticle");
    const imageInput = document.getElementById("newNewsImage");
    if (imageInput) imageInput.value = "";
    pendingNewsImageSrc = "";

    renderNewsDeleteSelect();
    renderNewsAdminList();
    updateNewsStatus("Noticia guardada correctamente.");
}

function initNewsAdmin() {
    const panel = document.getElementById("news-admin-panel");
    if (!panel) return;

    const saveButton = document.getElementById("saveNewNews");
    const imageInput = document.getElementById("newNewsImage");
    const toggleEditorButton = document.getElementById("toggleNewsEditMode");
    const deleteButton = document.getElementById("deleteSelectedNews");

    if (saveButton) {
        saveButton.addEventListener("click", saveNewNews);
    }
    if (imageInput) {
        imageInput.addEventListener("change", onNewNewsImageChange);
    }
    if (toggleEditorButton) {
        toggleEditorButton.addEventListener("click", toggleNewsEditMode);
    }
    if (deleteButton) {
        deleteButton.addEventListener("click", deleteSelectedNews);
    }

    renderNewsDeleteSelect();
    renderNewsAdminList();
}

function initGalleryAdmin() {
    const panel = document.getElementById("gallery-admin-panel");
    if (!panel) return;

    const filesInput = document.getElementById("newGalleryFiles");
    const saveButton = document.getElementById("saveNewGallery");
    const toggleEditorButton = document.getElementById("toggleGalleryEditMode");
    const deleteGalleryButton = document.getElementById("deleteSelectedGallery");

    if (filesInput) {
        filesInput.addEventListener("change", onNewGalleryFilesChange);
    }

    if (saveButton) {
        saveButton.addEventListener("click", saveNewGallery);
    }

    if (toggleEditorButton) {
        toggleEditorButton.addEventListener("click", toggleGalleryEditMode);
    }

    if (deleteGalleryButton) {
        deleteGalleryButton.addEventListener("click", deleteSelectedGallery);
    }

    renderPendingGalleryPhotos();
    renderGalleryDeleteSelect();
    renderGalleryAdminList();
}

function updatePlayersStatus(message) {
    const el = document.getElementById("playersAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function updateSponsorsStatus(message) {
    const el = document.getElementById("sponsorsAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function normalizePlayerImagePath(pathValue) {
    const raw = String(pathValue || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:")) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.includes("/")) return raw;
    return `assets/images/players/${raw}`;
}

function normalizeSponsorImagePath(pathValue) {
    const raw = String(pathValue || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:")) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.includes("/")) return raw;
    return `assets/images/sponsors/${raw}`;
}

function normalizePlayerItem(item) {
    return {
        id: item?.id || createId("player"),
        name: String(item?.name || "").trim(),
        country: String(item?.country || "").trim().toUpperCase(),
        ranking: Number(item?.ranking) || "",
        image: normalizePlayerImagePath(item?.image || item?.imageSrc || ""),
        seed: String(item?.seed || "").trim(),
        photoPosition: String(item?.photoPosition || "").trim()
    };
}

function normalizeSponsorItem(item) {
    return {
        id: item?.id || createId("sponsor"),
        name: String(item?.name || "Sponsor").trim() || "Sponsor",
        link: String(item?.link || item?.href || "#").trim() || "#",
        imageSrc: normalizeSponsorImagePath(item?.imageSrc || item?.src || ""),
        cardClass: String(item?.cardClass || "sponsor-card").trim() || "sponsor-card"
    };
}

function readPlayersFromStorage() {
    try {
        const raw = localStorage.getItem(PLAYERS_COLLECTION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed.map(normalizePlayerItem).filter((item) => item.name && item.country && item.image);
    } catch (error) {
        return null;
    }
}

function savePlayersToStorage(collection) {
    try {
        localStorage.setItem(PLAYERS_COLLECTION_KEY, JSON.stringify(collection));
        return true;
    } catch (error) {
        return false;
    }
}

async function readBasePlayersFromFile() {
    try {
        const response = await fetch("data/players.json", { cache: "no-store" });
        if (!response.ok) return [];
        const payload = await response.json();
        if (!Array.isArray(payload)) return [];
        return payload
            .map((item, index) => normalizePlayerItem({ ...item, id: `player_base_${index}` }))
            .filter((entry) => entry.name && entry.country && entry.image);
    } catch (error) {
        return [];
    }
}

async function getPlayersCollectionForAdmin() {
    const stored = readPlayersFromStorage();
    if (stored) return stored;
    return readBasePlayersFromFile();
}

function readSponsorsFromStorage() {
    try {
        const raw = localStorage.getItem(SPONSORS_COLLECTION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed.map(normalizeSponsorItem).filter((item) => item.imageSrc);
    } catch (error) {
        return null;
    }
}

let sponsorsTemplateCache = null;

function filenameToSponsorName(src, fallbackIndex) {
    const raw = String(src || "").trim();
    if (!raw) return `Sponsor ${String(fallbackIndex + 1).padStart(2, "0")}`;

    const file = raw.split("/").pop() || "";
    const base = file.replace(/\.[^.]+$/, "");
    const cleaned = base.replace(/[-_]+/g, " ").trim();
    if (!cleaned) return `Sponsor ${String(fallbackIndex + 1).padStart(2, "0")}`;

    return cleaned
        .split(" ")
        .map((word) => word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : "")
        .join(" ");
}

async function readSponsorsFromIndexTemplate() {
    if (Array.isArray(sponsorsTemplateCache)) {
        return sponsorsTemplateCache;
    }

    try {
        const response = await fetch("index.html", { cache: "no-store" });
        if (!response.ok) return [];

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const anchors = Array.from(doc.querySelectorAll("#sponsors .sponsors-grid a"));

        const parsed = anchors.map((anchor, index) => {
            const img = anchor.querySelector("img");
            const imageSrc = normalizeSponsorImagePath(img?.getAttribute("src") || "");
            const alt = String(img?.getAttribute("alt") || "").trim();
            const link = String(anchor.getAttribute("href") || "#").trim() || "#";
            const cardClass = String(anchor.getAttribute("class") || "sponsor-card").trim() || "sponsor-card";

            return normalizeSponsorItem({
                id: `sponsor_template_${index}`,
                name: alt || filenameToSponsorName(imageSrc, index),
                link,
                imageSrc,
                cardClass
            });
        }).filter((item) => !!item.imageSrc);

        sponsorsTemplateCache = parsed;
        return parsed;
    } catch (error) {
        return [];
    }
}

function saveSponsorsToStorage(collection) {
    try {
        localStorage.setItem(SPONSORS_COLLECTION_KEY, JSON.stringify(collection));
        return true;
    } catch (error) {
        return false;
    }
}

async function getSponsorsCollectionForAdmin() {
    const stored = readSponsorsFromStorage();
    if (Array.isArray(stored) && stored.length > 0) {
        return stored;
    }

    const fromTemplate = await readSponsorsFromIndexTemplate();
    if (Array.isArray(fromTemplate) && fromTemplate.length > 0) {
        return fromTemplate;
    }

    return getDefaultSponsors();
}

function getDefaultSponsors() {
    return [
        { id: "sponsor_default_olympia", name: "Olympia", link: "https://www.olympiahotel.com/", imageSrc: "assets/images/sponsors/olympia.png", cardClass: "sponsor-card sponsor-card-olympia" },
        { id: "sponsor_default_01", name: "Sponsor 01", link: "#", imageSrc: "assets/images/sponsors/sponsor-01.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_02", name: "Sponsor 02", link: "#", imageSrc: "assets/images/sponsors/sponsor-02.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_03", name: "Sponsor 03", link: "#", imageSrc: "assets/images/sponsors/sponsor-03.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_04", name: "Sponsor 04", link: "#", imageSrc: "assets/images/sponsors/sponsor-04.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_05", name: "Sponsor 05", link: "#", imageSrc: "assets/images/sponsors/sponsor-05.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_06", name: "Sponsor 06", link: "#", imageSrc: "assets/images/sponsors/sponsor-06.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_07", name: "Sponsor 07", link: "#", imageSrc: "assets/images/sponsors/sponsor-07.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_08", name: "Sponsor 08", link: "#", imageSrc: "assets/images/sponsors/sponsor-08.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_09", name: "Sponsor 09", link: "#", imageSrc: "assets/images/sponsors/sponsor-09.jpg", cardClass: "sponsor-card" },
        { id: "sponsor_default_10", name: "Sponsor 10", link: "#", imageSrc: "assets/images/sponsors/sponsor-10.jpg", cardClass: "sponsor-card" }
    ].map(normalizeSponsorItem);
}

async function createPlayerFromInputs() {
    const name = (document.getElementById("newPlayerName")?.value || "").trim();
    const country = (document.getElementById("newPlayerCountry")?.value || "").trim().toUpperCase();
    const rankingRaw = (document.getElementById("newPlayerRanking")?.value || "").trim();
    const seed = (document.getElementById("newPlayerSeed")?.value || "").trim();
    const photoPosition = (document.getElementById("newPlayerPhotoPosition")?.value || "").trim();
    const imagePath = normalizePlayerImagePath((document.getElementById("newPlayerImagePath")?.value || "").trim());
    const imageFile = document.getElementById("newPlayerImage")?.files?.[0] || null;

    if (!name || !country || !rankingRaw) {
        updatePlayersStatus("Nombre, país y ranking son obligatorios.");
        return null;
    }

    let image = imagePath;
    if (imageFile) {
        image = await readFileAsDataUrl(imageFile);
    }

    if (!image) {
        updatePlayersStatus("Indica ruta de imagen o sube una foto para el jugador.");
        return null;
    }

    return normalizePlayerItem({
        id: createId("player"),
        name,
        country,
        ranking: Number(rankingRaw),
        image,
        seed,
        photoPosition
    });
}

async function createSponsorFromInputs() {
    const name = (document.getElementById("newSponsorName")?.value || "").trim();
    const link = (document.getElementById("newSponsorLink")?.value || "").trim();
    const imagePath = normalizeSponsorImagePath((document.getElementById("newSponsorImagePath")?.value || "").trim());
    const imageFile = document.getElementById("newSponsorImage")?.files?.[0] || null;

    if (!name) {
        updateSponsorsStatus("El nombre del sponsor es obligatorio.");
        return null;
    }

    let imageSrc = imagePath;
    if (imageFile) {
        imageSrc = await readFileAsDataUrl(imageFile);
    }

    if (!imageSrc) {
        updateSponsorsStatus("Indica ruta de imagen o sube una imagen para el sponsor.");
        return null;
    }

    return normalizeSponsorItem({
        id: createId("sponsor"),
        name,
        link: link || "#",
        imageSrc,
        cardClass: "sponsor-card"
    });
}

async function renderPlayersAdminList() {
    const host = document.getElementById("playersAdminList");
    if (!host) return;

    const players = await getPlayersCollectionForAdmin();
    if (players.length === 0) {
        host.innerHTML = '<p class="admin-muted">No hay jugadores cargados.</p>';
        return;
    }

    host.innerHTML = players.map((player) => `
        <article class="gallery-admin-card" data-player-id="${player.id}">
            <img class="gallery-thumb" src="${escapeHtml(player.image)}" alt="${escapeHtml(player.name)}">
            <label class="field-label" for="playerName_${player.id}">Nombre</label>
            <input id="playerName_${player.id}" type="text" value="${escapeHtml(player.name)}">
            <div class="results-grid">
                <div>
                    <label class="field-label" for="playerCountry_${player.id}">País</label>
                    <input id="playerCountry_${player.id}" type="text" value="${escapeHtml(player.country)}" maxlength="3">
                </div>
                <div>
                    <label class="field-label" for="playerRanking_${player.id}">Ranking</label>
                    <input id="playerRanking_${player.id}" type="number" min="1" value="${escapeHtml(player.ranking)}">
                </div>
            </div>
            <div class="results-grid">
                <div>
                    <label class="field-label" for="playerSeed_${player.id}">Seed</label>
                    <input id="playerSeed_${player.id}" type="text" value="${escapeHtml(player.seed || "")}">
                </div>
                <div>
                    <label class="field-label" for="playerPhotoPos_${player.id}">Posición foto</label>
                    <input id="playerPhotoPos_${player.id}" type="text" value="${escapeHtml(player.photoPosition || "")}">
                </div>
            </div>
            <label class="field-label" for="playerImagePath_${player.id}">Ruta imagen</label>
            <input id="playerImagePath_${player.id}" type="text" value="${escapeHtml(player.image)}">
            <label class="field-label" for="playerImageFile_${player.id}">O subir imagen nueva</label>
            <input id="playerImageFile_${player.id}" type="file" accept="image/*">
            <div class="gallery-photo-actions">
                <button type="button" class="btn-gallery-save" data-action="save-player" data-player-id="${player.id}">Guardar</button>
                <button type="button" class="btn-gallery-danger" data-action="delete-player" data-player-id="${player.id}">Borrar</button>
            </div>
        </article>
    `).join("");

    host.querySelectorAll("[data-action='save-player']").forEach((button) => {
        button.addEventListener("click", async () => {
            const playerId = button.getAttribute("data-player-id");
            const collection = await getPlayersCollectionForAdmin();
            const player = collection.find((entry) => entry.id === playerId);
            if (!player) return;

            const name = (document.getElementById(`playerName_${playerId}`)?.value || "").trim();
            const country = (document.getElementById(`playerCountry_${playerId}`)?.value || "").trim().toUpperCase();
            const rankingRaw = (document.getElementById(`playerRanking_${playerId}`)?.value || "").trim();
            const seed = (document.getElementById(`playerSeed_${playerId}`)?.value || "").trim();
            const photoPosition = (document.getElementById(`playerPhotoPos_${playerId}`)?.value || "").trim();
            const imagePath = normalizePlayerImagePath((document.getElementById(`playerImagePath_${playerId}`)?.value || "").trim());
            const fileInput = document.getElementById(`playerImageFile_${playerId}`);
            const file = fileInput?.files?.[0] || null;

            if (!name || !country || !rankingRaw) {
                updatePlayersStatus("Nombre, país y ranking son obligatorios para guardar.");
                return;
            }

            let image = imagePath;
            if (file) {
                image = await readFileAsDataUrl(file);
            }

            if (!image) {
                updatePlayersStatus("Cada jugador debe tener imagen.");
                return;
            }

            Object.assign(player, normalizePlayerItem({
                id: player.id,
                name,
                country,
                ranking: Number(rankingRaw),
                image,
                seed,
                photoPosition
            }));

            const saved = savePlayersToStorage(collection);
            if (!saved) {
                updatePlayersStatus("No se pudo guardar la lista de jugadores.");
                return;
            }

            updatePlayersStatus("Jugador actualizado.");
            renderPlayersAdminList();
        });
    });

    host.querySelectorAll("[data-action='delete-player']").forEach((button) => {
        button.addEventListener("click", async () => {
            const playerId = button.getAttribute("data-player-id");
            const collection = await getPlayersCollectionForAdmin();
            const next = collection.filter((entry) => entry.id !== playerId);
            const saved = savePlayersToStorage(next);
            if (!saved) {
                updatePlayersStatus("No se pudo borrar el jugador.");
                return;
            }

            updatePlayersStatus("Jugador eliminado.");
            renderPlayersAdminList();
        });
    });
}

async function renderSponsorsAdminList() {
    const host = document.getElementById("sponsorsAdminList");
    if (!host) return;

    const sponsors = await getSponsorsCollectionForAdmin();
    if (sponsors.length === 0) {
        host.innerHTML = '<p class="admin-muted">No hay sponsors cargados.</p>';
        return;
    }

    host.innerHTML = sponsors.map((sponsor) => `
        <article class="gallery-admin-card" data-sponsor-id="${sponsor.id}">
            <img class="gallery-thumb" src="${escapeHtml(sponsor.imageSrc)}" alt="${escapeHtml(sponsor.name)}">
            <label class="field-label" for="sponsorName_${sponsor.id}">Nombre</label>
            <input id="sponsorName_${sponsor.id}" type="text" value="${escapeHtml(sponsor.name)}">
            <label class="field-label" for="sponsorLink_${sponsor.id}">Enlace</label>
            <input id="sponsorLink_${sponsor.id}" type="url" value="${escapeHtml(sponsor.link || "#")}">
            <label class="field-label" for="sponsorImagePath_${sponsor.id}">Ruta imagen</label>
            <input id="sponsorImagePath_${sponsor.id}" type="text" value="${escapeHtml(sponsor.imageSrc)}">
            <label class="field-label" for="sponsorImageFile_${sponsor.id}">O subir imagen nueva</label>
            <input id="sponsorImageFile_${sponsor.id}" type="file" accept="image/*">
            <div class="gallery-photo-actions">
                <button type="button" class="btn-gallery-save" data-action="save-sponsor" data-sponsor-id="${sponsor.id}">Guardar</button>
                <button type="button" class="btn-gallery-danger" data-action="delete-sponsor" data-sponsor-id="${sponsor.id}">Borrar</button>
            </div>
        </article>
    `).join("");

    host.querySelectorAll("[data-action='save-sponsor']").forEach((button) => {
        button.addEventListener("click", async () => {
            const sponsorId = button.getAttribute("data-sponsor-id");
            const collection = await getSponsorsCollectionForAdmin();
            const sponsor = collection.find((entry) => entry.id === sponsorId);
            if (!sponsor) return;

            const name = (document.getElementById(`sponsorName_${sponsorId}`)?.value || "").trim();
            const link = (document.getElementById(`sponsorLink_${sponsorId}`)?.value || "").trim();
            const pathValue = normalizeSponsorImagePath((document.getElementById(`sponsorImagePath_${sponsorId}`)?.value || "").trim());
            const fileInput = document.getElementById(`sponsorImageFile_${sponsorId}`);
            const file = fileInput?.files?.[0] || null;

            if (!name) {
                updateSponsorsStatus("El nombre del sponsor es obligatorio.");
                return;
            }

            let imageSrc = pathValue;
            if (file) {
                imageSrc = await readFileAsDataUrl(file);
            }

            if (!imageSrc) {
                updateSponsorsStatus("Cada sponsor debe tener imagen.");
                return;
            }

            Object.assign(sponsor, normalizeSponsorItem({
                id: sponsor.id,
                name,
                link: link || "#",
                imageSrc,
                cardClass: sponsor.cardClass || "sponsor-card"
            }));

            const saved = saveSponsorsToStorage(collection);
            if (!saved) {
                updateSponsorsStatus("No se pudo guardar la lista de sponsors.");
                return;
            }

            updateSponsorsStatus("Sponsor actualizado.");
            renderSponsorsAdminList();
        });
    });

    host.querySelectorAll("[data-action='delete-sponsor']").forEach((button) => {
        button.addEventListener("click", async () => {
            const sponsorId = button.getAttribute("data-sponsor-id");
            const collection = await getSponsorsCollectionForAdmin();
            const next = collection.filter((entry) => entry.id !== sponsorId);

            const saved = saveSponsorsToStorage(next);
            if (!saved) {
                updateSponsorsStatus("No se pudo borrar el sponsor.");
                return;
            }

            updateSponsorsStatus("Sponsor eliminado.");
            renderSponsorsAdminList();
        });
    });
}

async function saveNewPlayer() {
    const newPlayer = await createPlayerFromInputs();
    if (!newPlayer) return;

    const collection = await getPlayersCollectionForAdmin();
    collection.push(newPlayer);

    const saved = savePlayersToStorage(collection);
    if (!saved) {
        updatePlayersStatus("No se pudo guardar el nuevo jugador.");
        return;
    }

    ["newPlayerName", "newPlayerCountry", "newPlayerRanking", "newPlayerSeed", "newPlayerPhotoPosition", "newPlayerImagePath"].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    const imageInput = document.getElementById("newPlayerImage");
    if (imageInput) imageInput.value = "";

    updatePlayersStatus("Jugador añadido correctamente.");
    renderPlayersAdminList();
}

async function saveNewSponsor() {
    const newSponsor = await createSponsorFromInputs();
    if (!newSponsor) return;

    const collection = await getSponsorsCollectionForAdmin();
    collection.push(newSponsor);

    const saved = saveSponsorsToStorage(collection);
    if (!saved) {
        updateSponsorsStatus("No se pudo guardar el nuevo sponsor.");
        return;
    }

    ["newSponsorName", "newSponsorLink", "newSponsorImagePath"].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    const imageInput = document.getElementById("newSponsorImage");
    if (imageInput) imageInput.value = "";

    updateSponsorsStatus("Sponsor añadido correctamente.");
    renderSponsorsAdminList();
}

async function resetSponsorsCollection() {
    const defaults = getDefaultSponsors();
    const saved = saveSponsorsToStorage(defaults);
    if (!saved) {
        updateSponsorsStatus("No se pudo restaurar la lista base de sponsors.");
        return;
    }

    updateSponsorsStatus("Sponsors base restaurados.");
    renderSponsorsAdminList();
}

async function recoverCurrentSponsors() {
    const fromTemplate = await readSponsorsFromIndexTemplate();
    if (!Array.isArray(fromTemplate) || fromTemplate.length === 0) {
        updateSponsorsStatus("No se pudieron recuperar sponsors actuales de la web.");
        return;
    }

    const saved = saveSponsorsToStorage(fromTemplate);
    if (!saved) {
        updateSponsorsStatus("No se pudo guardar la recuperación de sponsors.");
        return;
    }

    updateSponsorsStatus(`Sponsors actuales recuperados: ${fromTemplate.length}.`);
    renderSponsorsAdminList();
}

function resetPlayersCollection() {
    localStorage.removeItem(PLAYERS_COLLECTION_KEY);
    updatePlayersStatus("Jugadores base restaurados.");
    renderPlayersAdminList();
}

async function importPlayersCurrent() {
    const currentPlayers = await readBasePlayersFromFile();
    if (!Array.isArray(currentPlayers) || currentPlayers.length === 0) {
        updatePlayersStatus("No se pudieron importar los jugadores actuales.");
        return;
    }

    const saved = savePlayersToStorage(currentPlayers);
    if (!saved) {
        updatePlayersStatus("No se pudo guardar la importación de jugadores.");
        return;
    }

    updatePlayersStatus(`Jugadores actuales importados: ${currentPlayers.length}.`);
    renderPlayersAdminList();
}

function initPlayersAdmin() {
    const panel = document.getElementById("players-admin-panel");
    if (!panel) return;

    const saveBtn = document.getElementById("saveNewPlayer");
    const importBtn = document.getElementById("importPlayersCurrent");
    const resetBtn = document.getElementById("resetPlayersCollection");

    if (saveBtn) {
        saveBtn.addEventListener("click", saveNewPlayer);
    }
    if (importBtn) {
        importBtn.addEventListener("click", importPlayersCurrent);
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", resetPlayersCollection);
    }

    renderPlayersAdminList();
}

function initSponsorsAdmin() {
    const panel = document.getElementById("sponsors-admin-panel");
    if (!panel) return;

    const saveBtn = document.getElementById("saveNewSponsor");
    const recoverBtn = document.getElementById("recoverCurrentSponsors");
    const resetBtn = document.getElementById("resetSponsorsCollection");

    if (saveBtn) {
        saveBtn.addEventListener("click", saveNewSponsor);
    }
    if (recoverBtn) {
        recoverBtn.addEventListener("click", recoverCurrentSponsors);
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", resetSponsorsCollection);
    }

    renderSponsorsAdminList();
}

function toScore(value) {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function isMutedPlayer(name) {
    return !name || name === "TBD" || name === "BYE";
}

function isByePlayer(name) {
    return name === "BYE";
}

function countSetsWon(games, side) {
    const mine = side === "p1" ? "p1" : "p2";
    const opp = side === "p1" ? "p2" : "p1";
    return games.reduce((sum, game) => {
        const m = toScore(game?.[mine]);
        const o = toScore(game?.[opp]);
        if (m === null || o === null) return sum;
        return m > o ? sum + 1 : sum;
    }, 0);
}

function getMatchWinner(match) {
    if (match.p1?.name === "BYE" && !isMutedPlayer(match.p2?.name)) return match.p2;
    if (match.p2?.name === "BYE" && !isMutedPlayer(match.p1?.name)) return match.p1;
    if (isMutedPlayer(match.p1?.name) || isMutedPlayer(match.p2?.name)) return null;

    const p1Sets = countSetsWon(match.games, "p1");
    const p2Sets = countSetsWon(match.games, "p2");
    if (p1Sets === p2Sets) return null;
    return p1Sets > p2Sets ? match.p1 : match.p2;
}

function buildGamesFromSets(p1Sets, p2Sets) {
    const games = [];

    for (let i = 0; i < p1Sets; i += 1) {
        games.push({ p1: 11, p2: 7 });
    }

    for (let i = 0; i < p2Sets; i += 1) {
        games.push({ p1: 7, p2: 11 });
    }

    return Array.from({ length: 5 }, (_, i) => games[i] || { p1: null, p2: null });
}

function normalizeBracket(bracket) {
    bracket.rounds.forEach((round) => {
        round.matches.forEach((match) => {
            if (!match.p1) match.p1 = { name: "TBD" };
            if (!match.p2) match.p2 = { name: "TBD" };
            if (!Array.isArray(match.games)) {
                match.games = Array.from({ length: 5 }, () => ({ p1: null, p2: null }));
            }
            if (match.games.length < 5) {
                const missing = 5 - match.games.length;
                for (let i = 0; i < missing; i += 1) {
                    match.games.push({ p1: null, p2: null });
                }
            }
        });
    });
}

function autoAdvanceBracket(bracket) {
    for (let roundIndex = 1; roundIndex < bracket.rounds.length; roundIndex += 1) {
        bracket.rounds[roundIndex].matches.forEach((match) => {
            match.p1 = { name: "TBD" };
            match.p2 = { name: "TBD" };
            if (!Array.isArray(match.games)) {
                match.games = Array.from({ length: 5 }, () => ({ p1: null, p2: null }));
            }
            match.games = match.games.map(() => ({ p1: null, p2: null }));
        });
    }

    for (let roundIndex = 0; roundIndex < bracket.rounds.length - 1; roundIndex += 1) {
        const currentRound = bracket.rounds[roundIndex];
        const nextRound = bracket.rounds[roundIndex + 1];

        currentRound.matches.forEach((match, matchIndex) => {
            const winner = getMatchWinner(match);
            if (!winner) return;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const slot = matchIndex % 2 === 0 ? "p1" : "p2";
            if (!nextRound.matches[nextMatchIndex]) return;
            nextRound.matches[nextMatchIndex][slot] = {
                name: winner.name,
                image: winner.image || null
            };
        });
    }
}

function updateDrawStatus(message) {
    const el = document.getElementById("drawAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function updateScheduleStatus(message) {
    const el = document.getElementById("scheduleAdminStatus");
    if (!el) return;
    el.textContent = message;
}

function getSelectedMatch() {
    const roundSelect = document.getElementById("roundSelect");
    const matchSelect = document.getElementById("matchSelect");
    if (!drawState || !roundSelect || !matchSelect) return null;
    const r = Number(roundSelect.value);
    const m = Number(matchSelect.value);
    if (!drawState.rounds[r] || !drawState.rounds[r].matches[m]) return null;
    return { roundIndex: r, matchIndex: m, match: drawState.rounds[r].matches[m] };
}

function setResultInputsDisabled(disabled) {
    const ids = [
        "p1Sets", "p2Sets",
        "p1g1", "p1g2", "p1g3", "p1g4", "p1g5",
        "p2g1", "p2g2", "p2g3", "p2g4", "p2g5",
        "saveMatchResult"
    ];

    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
    });
}

function clearMatchEditor(message) {
    document.getElementById("p1Name").textContent = "P1";
    document.getElementById("p2Name").textContent = "P2";
    document.getElementById("playersPreview").textContent = message;

    ["p1Sets", "p2Sets", "p1g1", "p1g2", "p1g3", "p1g4", "p1g5", "p2g1", "p2g2", "p2g3", "p2g4", "p2g5"]
        .forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
}

function fillMatchEditor() {
    const selected = getSelectedMatch();
    if (!selected) {
        setResultInputsDisabled(true);
        clearMatchEditor("No hay partido editable en esta ronda.");
        return;
    }
    const { match } = selected;

    if (isMutedPlayer(match.p1?.name) || isMutedPlayer(match.p2?.name)) {
        setResultInputsDisabled(true);
        clearMatchEditor("Partido automatico (BYE/TBD). No requiere resultado manual.");
        return;
    }

    setResultInputsDisabled(false);

    document.getElementById("p1Name").textContent = match.p1?.name || "P1";
    document.getElementById("p2Name").textContent = match.p2?.name || "P2";
    document.getElementById("playersPreview").textContent = `${match.p1?.name || "P1"} vs ${match.p2?.name || "P2"}`;

    const p1Sets = countSetsWon(match.games, "p1");
    const p2Sets = countSetsWon(match.games, "p2");
    document.getElementById("p1Sets").value = p1Sets;
    document.getElementById("p2Sets").value = p2Sets;

    for (let i = 0; i < 5; i += 1) {
        const g = match.games[i] || { p1: null, p2: null };
        document.getElementById(`p1g${i + 1}`).value = g.p1 ?? "";
        document.getElementById(`p2g${i + 1}`).value = g.p2 ?? "";
    }
}

function populateMatchSelect() {
    const roundSelect = document.getElementById("roundSelect");
    const matchSelect = document.getElementById("matchSelect");
    if (!drawState || !roundSelect || !matchSelect) return;

    const roundIndex = Number(roundSelect.value);
    const round = drawState.rounds[roundIndex];
    matchSelect.innerHTML = "";

    const editableMatches = [];

    round.matches.forEach((match, i) => {
        const p1Auto = isMutedPlayer(match.p1?.name);
        const p2Auto = isMutedPlayer(match.p2?.name);
        if (!p1Auto && !p2Auto) {
            editableMatches.push(i);
        }
    });

    if (editableMatches.length === 0) {
        matchSelect.innerHTML = '<option value="" selected>Sin partidos editables</option>';
        fillMatchEditor();
        return;
    }

    editableMatches.forEach((matchIndex) => {
        matchSelect.innerHTML += `<option value="${matchIndex}">Partido ${matchIndex + 1}</option>`;
    });

    fillMatchEditor();
}

function populateRoundSelect() {
    const roundSelect = document.getElementById("roundSelect");
    if (!drawState || !roundSelect) return;

    roundSelect.innerHTML = "";
    drawState.rounds.forEach((round, i) => {
        roundSelect.innerHTML += `<option value="${i}">${round.title}</option>`;
    });

    populateMatchSelect();
}

function saveDrawState() {
    localStorage.setItem(DRAW_BRACKET_KEY, JSON.stringify(drawState));
}

function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}

function setDrawJsonEditorFromState() {
    const editor = document.getElementById("drawJsonEditor");
    if (!editor || !drawState) return;
    editor.value = JSON.stringify(drawState, null, 2);
}

function hydrateDrawAfterStructuralChange(statusMessage) {
    normalizeBracket(drawState);
    autoAdvanceBracket(drawState);
    saveDrawState();
    populateRoundSelect();
    populateScheduleRoundSelect();
    setDrawJsonEditorFromState();
    if (statusMessage) {
        updateDrawStatus(statusMessage);
    }
}

function applyDrawJson() {
    const editor = document.getElementById("drawJsonEditor");
    if (!editor) return;

    const raw = String(editor.value || "").trim();
    if (!raw) {
        updateDrawStatus("Pega un JSON válido para aplicar el cuadro.");
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.rounds)) {
            updateDrawStatus("JSON inválido: debe incluir rounds[].");
            return;
        }

        drawState = cloneDeep(parsed);
        hydrateDrawAfterStructuralChange("Cuadro actualizado desde JSON.");
    } catch (error) {
        updateDrawStatus(`JSON inválido: ${error.message}`);
    }
}

function copyDrawJson() {
    const editor = document.getElementById("drawJsonEditor");
    if (!editor) return;

    const text = String(editor.value || "");
    if (!text.trim()) {
        updateDrawStatus("No hay JSON para copiar.");
        return;
    }

    const fallbackCopy = () => {
        editor.focus();
        editor.select();
        try {
            const ok = document.execCommand("copy");
            updateDrawStatus(ok ? "JSON copiado al portapapeles." : "No se pudo copiar automáticamente.");
        } catch (error) {
            updateDrawStatus("No se pudo copiar automáticamente.");
        }
    };

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => updateDrawStatus("JSON copiado al portapapeles."))
            .catch(() => fallbackCopy());
        return;
    }

    fallbackCopy();
}

function importDrawFromWeb() {
    const raw = localStorage.getItem(DRAW_BRACKET_KEY);
    if (!raw) {
        updateDrawStatus("No hay cuadro actual guardado en la web para importar.");
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.rounds)) {
            updateDrawStatus("El cuadro guardado no tiene formato válido.");
            return;
        }

        drawState = cloneDeep(parsed);
        hydrateDrawAfterStructuralChange("Cuadro actual de la web importado correctamente.");
    } catch (error) {
        updateDrawStatus(`No se pudo importar el cuadro: ${error.message}`);
    }
}

function saveMatchResult() {
    const selected = getSelectedMatch();
    if (!selected) return;
    const { match } = selected;

    const enteredGames = Array.from({ length: 5 }, (_, i) => ({
        p1: toScore(document.getElementById(`p1g${i + 1}`).value),
        p2: toScore(document.getElementById(`p2g${i + 1}`).value)
    }));

    const hasAnyGameScore = enteredGames.some((game) => game.p1 !== null || game.p2 !== null);

    if (hasAnyGameScore) {
        match.games = enteredGames;
    } else {
        const p1SetsInput = toScore(document.getElementById("p1Sets")?.value);
        const p2SetsInput = toScore(document.getElementById("p2Sets")?.value);

        if (p1SetsInput === null || p2SetsInput === null || p1SetsInput === p2SetsInput) {
            updateDrawStatus("Introduce tanteo por juego o sets validos para publicar el resultado.");
            return;
        }

        match.games = buildGamesFromSets(p1SetsInput, p2SetsInput);
    }

    autoAdvanceBracket(drawState);
    saveDrawState();
    populateRoundSelect();
    populateScheduleRoundSelect();
    setDrawJsonEditorFromState();
    updateDrawStatus("Resultado guardado y cuadro actualizado.");
}

function getSelectedScheduleMatch() {
    const roundSelect = document.getElementById("scheduleRoundSelect");
    const matchSelect = document.getElementById("scheduleMatchSelect");
    if (!drawState || !roundSelect || !matchSelect) return null;

    const r = Number(roundSelect.value);
    const m = Number(matchSelect.value);

    if (!drawState.rounds[r] || !drawState.rounds[r].matches[m]) return null;

    return { roundIndex: r, matchIndex: m, match: drawState.rounds[r].matches[m] };
}

function fillScheduleEditor() {
    const selected = getSelectedScheduleMatch();
    const preview = document.getElementById("schedulePlayersPreview");
    const dateInput = document.getElementById("scheduleDate");
    const saveBtn = document.getElementById("saveMatchSchedule");

    if (!selected) {
        if (preview) preview.textContent = "No hay partido seleccionado.";
        if (dateInput) dateInput.value = "";
        if (saveBtn) saveBtn.disabled = true;
        return;
    }

    const { match } = selected;
    if (isByePlayer(match.p1?.name) || isByePlayer(match.p2?.name)) {
        if (preview) preview.textContent = "Partido automatico (BYE). No requiere horario.";
        if (dateInput) dateInput.value = "";
        if (saveBtn) saveBtn.disabled = true;
        return;
    }

    if (preview) {
        preview.textContent = `${match.p1?.name || "TBD"} vs ${match.p2?.name || "TBD"}`;
    }
    if (dateInput) {
        dateInput.value = match.date || "";
    }
    if (saveBtn) saveBtn.disabled = false;
}

function populateScheduleMatchSelect() {
    const roundSelect = document.getElementById("scheduleRoundSelect");
    const matchSelect = document.getElementById("scheduleMatchSelect");
    if (!drawState || !roundSelect || !matchSelect) return;

    const roundIndex = Number(roundSelect.value);
    const round = drawState.rounds[roundIndex];

    matchSelect.innerHTML = "";

    const schedulableMatches = [];
    round.matches.forEach((match, i) => {
        const hasBye = isByePlayer(match.p1?.name) || isByePlayer(match.p2?.name);
        if (!hasBye) {
            schedulableMatches.push(i);
        }
    });

    if (schedulableMatches.length === 0) {
        matchSelect.innerHTML = '<option value="" selected>Sin partidos programables</option>';
        fillScheduleEditor();
        return;
    }

    schedulableMatches.forEach((matchIndex) => {
        matchSelect.innerHTML += `<option value="${matchIndex}">Partido ${matchIndex + 1}</option>`;
    });

    fillScheduleEditor();
}

function populateScheduleRoundSelect() {
    const roundSelect = document.getElementById("scheduleRoundSelect");
    if (!drawState || !roundSelect) return;

    roundSelect.innerHTML = "";
    drawState.rounds.forEach((round, i) => {
        roundSelect.innerHTML += `<option value="${i}">${round.title}</option>`;
    });

    populateScheduleMatchSelect();
}

function saveMatchSchedule() {
    const selected = getSelectedScheduleMatch();
    if (!selected) return;

    const dateInput = document.getElementById("scheduleDate");
    const newDate = (dateInput?.value || "").trim();

    selected.match.date = newDate;

    saveDrawState();
    setDrawJsonEditorFromState();
    updateScheduleStatus("Horario guardado correctamente.");
}

function resetDrawState() {
    if (drawBaseState) {
        drawState = cloneDeep(drawBaseState);
        hydrateDrawAfterStructuralChange("Cuadro restaurado a la base actual.");
        return;
    }

    localStorage.removeItem(DRAW_BRACKET_KEY);
    updateDrawStatus("Cuadro reseteado. Recarga para tomar el JSON base.");
}

async function initDrawAdmin() {
    const panel = document.getElementById("draw-results-panel");
    if (!panel) return;

    const response = await fetch("data/draw-bracket.json", { cache: "no-store" });
    const baseBracket = await response.json();
    drawBaseState = cloneDeep(baseBracket);
    const stored = localStorage.getItem(DRAW_BRACKET_KEY);

    drawState = stored ? JSON.parse(stored) : baseBracket;
    normalizeBracket(drawState);
    autoAdvanceBracket(drawState);
    saveDrawState();
    setDrawJsonEditorFromState();

    populateRoundSelect();
    populateScheduleRoundSelect();

    const roundSelect = document.getElementById("roundSelect");
    const matchSelect = document.getElementById("matchSelect");
    const saveBtn = document.getElementById("saveMatchResult");
    const resetBtn = document.getElementById("resetDrawState");
    const importDrawBtn = document.getElementById("importDrawFromWeb");
    const loadJsonBtn = document.getElementById("loadCurrentDrawJson");
    const applyJsonBtn = document.getElementById("applyDrawJson");
    const copyJsonBtn = document.getElementById("copyDrawJson");
    const scheduleRoundSelect = document.getElementById("scheduleRoundSelect");
    const scheduleMatchSelect = document.getElementById("scheduleMatchSelect");
    const saveScheduleBtn = document.getElementById("saveMatchSchedule");

    roundSelect.addEventListener("change", populateMatchSelect);
    matchSelect.addEventListener("change", fillMatchEditor);
    saveBtn.addEventListener("click", saveMatchResult);
    resetBtn.addEventListener("click", resetDrawState);
    if (importDrawBtn) {
        importDrawBtn.addEventListener("click", importDrawFromWeb);
    }
    if (loadJsonBtn) {
        loadJsonBtn.addEventListener("click", setDrawJsonEditorFromState);
    }
    if (applyJsonBtn) {
        applyJsonBtn.addEventListener("click", applyDrawJson);
    }
    if (copyJsonBtn) {
        copyJsonBtn.addEventListener("click", copyDrawJson);
    }

    if (scheduleRoundSelect) {
        scheduleRoundSelect.addEventListener("change", populateScheduleMatchSelect);
    }
    if (scheduleMatchSelect) {
        scheduleMatchSelect.addEventListener("change", fillScheduleEditor);
    }
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener("click", saveMatchSchedule);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initAdminAuth();
});
