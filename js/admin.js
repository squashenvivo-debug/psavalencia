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
const LANGS = ["es", "va", "en", "fr"];

let drawState = null;
let pendingGalleryPhotos = [];
let galleryEditMode = false;
let pendingNewsImageSrc = "";
let newsEditMode = false;
let adminModulesStarted = false;

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

function startAdminModulesOnce() {
    if (adminModulesStarted) return;
    adminModulesStarted = true;

    loadTournamentSettings();
    bindTournamentSettings();
    loadLiveSettings();
    bindLiveSettings();
    initNewsAdmin();
    initGalleryAdmin();
    initDrawAdmin();
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
                startAdminModulesOnce();
                return;
            }

            // Fallback por si la sesión tarda en hidratarse en el cliente.
            const fallback = await supabaseClient.auth.getSession();
            if (fallback?.data?.session) {
                showAdminApp();
                startAdminModulesOnce();
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
            startAdminModulesOnce();
        } else {
            // Evita falsos negativos por eventos transitorios: verificamos sesión real.
            const fallback = await supabaseClient.auth.getSession();
            if (fallback?.data?.session) {
                showAdminApp();
                startAdminModulesOnce();
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
        startAdminModulesOnce();
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
    const input = document.getElementById("liveYoutubeUrl");
    if (!input) return;
    const history = readLiveHistory();
    input.value = history.length > 0
        ? history[history.length - 1]
        : (localStorage.getItem(LIVE_STREAM_URL_KEY) || "");
    renderLiveHistoryInfo(history);
}

function renderLiveHistoryInfo(history = readLiveHistory()) {
    const info = document.getElementById("liveHistoryInfo");
    if (!info) return;

    if (!history.length) {
        info.textContent = "Historial de directos: 0";
        return;
    }

    info.textContent = `Historial de directos: ${history.length} (actual: ${history.length}, miniaturas: ${Math.max(0, history.length - 1)})`;
}

function readLiveHistory() {
    try {
        const raw = localStorage.getItem(LIVE_STREAM_HISTORY_KEY);
        const current = (localStorage.getItem(LIVE_STREAM_URL_KEY) || "").trim();

        if (!raw) {
            return current ? [current] : [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return current ? [current] : [];
        }

        const cleaned = parsed
            .map((item) => String(item || "").trim())
            .filter(Boolean);

        if (cleaned.length === 0 && current) {
            return [current];
        }

        return cleaned;
    } catch (error) {
        const current = (localStorage.getItem(LIVE_STREAM_URL_KEY) || "").trim();
        return current ? [current] : [];
    }
}

function saveLiveSettings() {
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

    const history = readLiveHistory();
    const last = history[history.length - 1] || "";
    if (value !== last) {
        history.push(value);
    }

    localStorage.setItem(LIVE_STREAM_URL_KEY, value);
    localStorage.setItem(LIVE_STREAM_HISTORY_KEY, JSON.stringify(history));
    updateLiveStatus(`Enlace guardado. Historial de directos: ${history.length}.`);
    renderLiveHistoryInfo(history);
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

            const input = document.getElementById("liveYoutubeUrl");
            if (input) input.value = "";

            updateLiveStatus("Directo e historial borrados. Ya puedes hacer pruebas desde cero.");
            renderLiveHistoryInfo([]);
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
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=es|${encodeURIComponent(target)}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return source;

        const payload = await response.json();
        const translated = String(payload?.responseData?.translatedText || "").trim();
        return translated || source;
    } catch (error) {
        return source;
    }
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

function saveMatchResult() {
    const selected = getSelectedMatch();
    if (!selected) return;
    const { match } = selected;

    match.games = Array.from({ length: 5 }, (_, i) => ({
        p1: toScore(document.getElementById(`p1g${i + 1}`).value),
        p2: toScore(document.getElementById(`p2g${i + 1}`).value)
    }));

    autoAdvanceBracket(drawState);
    saveDrawState();
    populateRoundSelect();
    populateScheduleRoundSelect();
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
    updateScheduleStatus("Horario guardado correctamente.");
}

function resetDrawState() {
    localStorage.removeItem(DRAW_BRACKET_KEY);
    updateDrawStatus("Cuadro reseteado. Recarga para tomar el JSON base.");
}

async function initDrawAdmin() {
    const panel = document.getElementById("draw-results-panel");
    if (!panel) return;

    const response = await fetch("data/draw-bracket.json", { cache: "no-store" });
    const baseBracket = await response.json();
    const stored = localStorage.getItem(DRAW_BRACKET_KEY);

    drawState = stored ? JSON.parse(stored) : baseBracket;
    normalizeBracket(drawState);
    autoAdvanceBracket(drawState);
    saveDrawState();

    populateRoundSelect();
    populateScheduleRoundSelect();

    const roundSelect = document.getElementById("roundSelect");
    const matchSelect = document.getElementById("matchSelect");
    const saveBtn = document.getElementById("saveMatchResult");
    const resetBtn = document.getElementById("resetDrawState");
    const scheduleRoundSelect = document.getElementById("scheduleRoundSelect");
    const scheduleMatchSelect = document.getElementById("scheduleMatchSelect");
    const saveScheduleBtn = document.getElementById("saveMatchSchedule");

    roundSelect.addEventListener("change", populateMatchSelect);
    matchSelect.addEventListener("change", fillMatchEditor);
    saveBtn.addEventListener("click", saveMatchResult);
    resetBtn.addEventListener("click", resetDrawState);

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
