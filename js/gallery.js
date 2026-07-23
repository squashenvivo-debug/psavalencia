const GALLERY_COLLECTION_KEY = "galleryCollections";
const DYNAMIC_LANGS = ["es", "va", "en", "fr"];

function getCurrentLanguage() {
    const lang = (localStorage.getItem("language") || "es").toLowerCase();
    return DYNAMIC_LANGS.includes(lang) ? lang : "es";
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

function getLocalizedText(value, lang) {
    const localized = normalizeLocalizedText(value);
    return localized[lang] || localized.es || "";
}

function normalizeGalleryItem(item) {
    const photos = Array.isArray(item?.photos) ? item.photos : [];
    return {
        id: item?.id || "",
        title: normalizeLocalizedText(item?.title),
        photos: photos.map((photo) => ({
            id: photo?.id || "",
            src: photo?.src || "",
            caption: normalizeLocalizedText(photo?.caption)
        })).filter((photo) => !!photo.src)
    };
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById("galleryLightbox");
    const image = document.getElementById("galleryLightboxImage");
    const captionEl = document.getElementById("galleryLightboxCaption");
    if (!lightbox || !image || !captionEl) return;

    image.src = src;
    captionEl.textContent = caption || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    const image = document.getElementById("galleryLightboxImage");
    if (!lightbox || !image) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    image.src = "";
    document.body.style.overflow = "";
}

function bindLightboxEvents() {
    const lightbox = document.getElementById("galleryLightbox");
    const closeBtn = document.getElementById("galleryLightboxClose");
    if (!lightbox || !closeBtn) return;

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });
}

function readGalleryCollection() {
    try {
        const raw = localStorage.getItem(GALLERY_COLLECTION_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(normalizeGalleryItem) : [];
    } catch (error) {
        return [];
    }
}

function getGalleryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("galleryId") || "";
}

function renderGalleryDetail() {
    const allGalleries = readGalleryCollection();
    const galleryId = getGalleryIdFromUrl();
    const lang = getCurrentLanguage();

    const titleEl = document.getElementById("galleryPageTitle");
    const grid = document.getElementById("galleryDetailGrid");
    const empty = document.getElementById("galleryDetailEmpty");

    if (!titleEl || !grid || !empty) return;

    const gallery = allGalleries.find((item) => item.id === galleryId);
    if (!gallery) {
        titleEl.textContent = "Galería no encontrada";
        empty.style.display = "block";
        empty.textContent = "Esta galería no existe o fue eliminada.";
        return;
    }

    titleEl.textContent = getLocalizedText(gallery.title, lang) || "Galería";

    const photos = Array.isArray(gallery.photos) ? gallery.photos : [];
    if (photos.length === 0) {
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";
    grid.innerHTML = "";

    photos.forEach((photo) => {
        const card = document.createElement("figure");
        card.className = "gallery-detail-card";

        const caption = getLocalizedText(photo.caption, lang);

        card.innerHTML = `
            <img class="gallery-detail-image" src="${photo.src}" alt="${caption || titleEl.textContent || "Foto"}">
            <figcaption class="gallery-detail-caption">${caption || "Sin pie de foto"}</figcaption>
        `;

        const image = card.querySelector(".gallery-detail-image");
        if (image) {
            image.addEventListener("click", () => {
                openLightbox(photo.src, caption || "");
            });
        }

        grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindLightboxEvents();
    renderGalleryDetail();
});
