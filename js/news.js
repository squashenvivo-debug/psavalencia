const NEWS_COLLECTION_KEY = "newsCollection";
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

function normalizeNewsItem(item) {
    const article = item?.article || item?.summary || "";
    return {
        id: item?.id || "",
        imageSrc: item?.imageSrc || item?.image || "",
        title: normalizeLocalizedText(item?.title),
        article: normalizeLocalizedText(article),
        createdAt: item?.createdAt || ""
    };
}

function formatNewsDate(value, lang) {
    const dt = new Date(value || Date.now());
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(lang === "va" ? "ca-ES" : lang, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getNewsIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("newsId") || "";
}

async function readNewsCollection() {
    try {
        const raw = localStorage.getItem(NEWS_COLLECTION_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map(normalizeNewsItem);
            }
        }
    } catch (error) {
        return [];
    }

    try {
        const response = await fetch("data/translations/news.json", { cache: "no-store" });
        if (!response.ok) return [];
        const fallback = await response.json();
        if (!Array.isArray(fallback)) return [];

        return fallback.map((item, index) => ({
            id: `legacy_${index}`,
            imageSrc: `assets/images/news/${item.image}`,
            title: normalizeLocalizedText(item.title || ""),
            article: normalizeLocalizedText(item.summary || ""),
            createdAt: ""
        }));
    } catch (error) {
        return [];
    }
}

async function renderNewsDetail() {
    const titleEl = document.getElementById("newsPageTitle");
    const card = document.getElementById("newsPageArticle");
    const image = document.getElementById("newsPageImage");
    const dateEl = document.getElementById("newsPageDate");
    const heading = document.getElementById("newsPageHeading");
    const body = document.getElementById("newsPageBody");
    const empty = document.getElementById("newsPageEmpty");

    if (!titleEl || !card || !image || !dateEl || !heading || !body || !empty) return;

    const lang = getCurrentLanguage();
    const newsId = getNewsIdFromUrl();
    const collection = await readNewsCollection();
    const item = collection.find((entry) => entry.id === newsId);

    if (!item) {
        card.style.display = "none";
        empty.style.display = "block";
        return;
    }

    const title = getLocalizedText(item.title, lang);
    const article = getLocalizedText(item.article, lang);

    titleEl.textContent = title || "Noticia";
    heading.textContent = title || "";
    body.textContent = article || "";
    image.src = item.imageSrc || "";
    image.alt = title || "Noticia";
    dateEl.textContent = formatNewsDate(item.createdAt, lang);
}

document.addEventListener("DOMContentLoaded", renderNewsDetail);
