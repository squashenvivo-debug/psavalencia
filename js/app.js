/* ==========================================================
   PSA VALENCIA OPEN
   app.js
========================================================== */

/* ==========================================================
   INICIO
========================================================== */
let CONFIG = {};
const LIVE_STREAM_URL_KEY = "liveStreamYoutubeUrl";
const LIVE_STREAM_HISTORY_KEY = "liveStreamYoutubeHistory";
const GALLERY_COLLECTION_KEY = "galleryCollections";
const NEWS_COLLECTION_KEY = "newsCollection";
const DYNAMIC_LANGS = ["es", "va", "en", "fr"];

document.addEventListener("DOMContentLoaded", async () => {

    await loadConfig();

    initHeader();

    initCountdown();

    revealSections();

    await loadPlayers();

    initLiveStream();
    loadHomeGallery();

    await loadNews();
await loadSchedule();
await loadDraws();
loadTournamentCenter();

    document.addEventListener("app-language-changed", () => {
        initLiveStream();
        loadHomeGallery();
        loadNews();
    });
});


/* ==========================================================
   HEADER
========================================================== */

function initHeader() {

    const header = document.getElementById("header");

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    });

}



/* ==========================================================
   COUNTDOWN
========================================================== */

function initCountdown() {

    const targetDate = new Date("2026-08-11T10:00:00").getTime();

    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");

    if (!days) return;

    function updateCountdown() {

        const now = new Date().getTime();

        const distance = targetDate - now;

        if (distance <= 0) return;

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        days.textContent = String(d).padStart(2, "0");
        hours.textContent = String(h).padStart(2, "0");
        minutes.textContent = String(m).padStart(2, "0");
        seconds.textContent = String(s).padStart(2, "0");

    }

    updateCountdown();

    setInterval(updateCountdown, 1000);

}


/* ==========================================================
   REVEAL
========================================================== */

function revealSections() {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    }, {

        threshold: 0.20

    });

    document.querySelectorAll("section").forEach(section => {

        observer.observe(section);

    });

}


/* ==========================================================
   PLAYERS
========================================================== */

async function loadPlayers() {

    const grid = document.querySelector(".players-grid");

    if (!grid) return;

    try {

        let response = await fetch("data/players.json", { cache: "no-store" });

        if (!response.ok) {
            response = await fetch("data/translations/players.json", { cache: "no-store" });
        }

        if (!response.ok) {
            throw new Error("No se pudo cargar data/players.json ni data/translations/players.json");
        }

        const players = await response.json();

        grid.innerHTML = "";

        players.forEach(player => {

            const seedBadge = player.seed
                ? `<span class="player-seed">${player.seed}</span>`
                : `<span class="player-seed player-seed-empty">seed</span>`;

            const positionStyle = player.photoPosition
                ? ` style="object-position:${player.photoPosition};"`
                : "";

            grid.innerHTML += `

                <article class="player-card">

                    <div class="player-photo">
                        <img src="assets/images/players/${player.image}" alt="${player.name}"${positionStyle}>
                    </div>

                    <div class="player-info">

                        <div class="player-head">

                            <div class="player-name">${player.name}</div>

                            <div class="player-seed-row">${seedBadge}</div>

                        </div>

                        <p class="player-meta">WR: ${player.ranking}</p>

                        <div class="player-flag-row">
                            <img class="player-flag"
                                 src="assets/images/flags/${player.country}.svg"
                                 alt="${player.country}">
                        </div>

                    </div>

                </article>

            `;

        });

    } catch (error) {

        console.error("Error cargando jugadores:", error);

    }

}


/* ==========================================================
   NEWS
========================================================== */

async function loadNews() {

    const grid = document.querySelector(".news-grid");

    if (!grid) return;

    try {
        const lang = getCurrentLanguage();
        const ctaText = {
            es: "Leer más",
            va: "Llegir més",
            en: "Read more",
            fr: "Lire plus"
        };

        const dynamicNews = readNewsCollection();
        let news = dynamicNews;

        if (news.length === 0) {
            const response = await fetch("data/translations/news.json", { cache: "no-store" });
            if (!response.ok) throw new Error("No se pudo cargar translations/news.json");
            const fallbackNews = await response.json();
            news = (Array.isArray(fallbackNews) ? fallbackNews : []).map((item, index) => ({
                id: `legacy_${index}`,
                imageSrc: `assets/images/news/${item.image}`,
                title: normalizeLocalizedText(item.title || ""),
                article: normalizeLocalizedText(item.summary || ""),
                createdAt: new Date().toISOString()
            }));
        }

        grid.innerHTML = "";

        news.forEach((item) => {
            const title = getLocalizedText(item.title, lang);
            const article = getLocalizedText(item.article, lang);
            const summary = article.length > 150 ? `${article.slice(0, 150)}...` : article;
            const imageSrc = item.imageSrc || item.image || "";

            grid.innerHTML += `
                <article class="news-card">
                    <img src="${imageSrc}" alt="${title}">
                    <div class="news-content">
                        <span class="news-date">${formatNewsDate(item.createdAt, lang)}</span>
                        <h3>${title}</h3>
                        <p>${summary}</p>
                        <a href="news.html?newsId=${encodeURIComponent(item.id)}" class="btn btn-primary">
                            ${ctaText[lang] || ctaText.es}
                        </a>
                    </div>
                </article>
            `;
        });
    } catch (error) {
        console.error("Error cargando noticias:", error);
    }

}
/*==================================================
CONFIG
==================================================*/

async function loadConfig(){

    try{

        const response = await fetch("data/config.json");

        CONFIG = await response.json();

        document.title = CONFIG.event.name;

    }

    catch(error){

        console.error(error);

    }

}
/* ==========================================================
   SCHEDULE
========================================================== */

async function loadSchedule() {

    const list = document.querySelector(".schedule-list");

    if (!list) return;

    const response = await fetch("data/schedule.json");

    const matches = await response.json();

    list.innerHTML = "";

    matches.forEach(match => {

        list.innerHTML += `

        <div class="schedule-match">

            <strong>${match.time}</strong>

            <span>${match.court}</span>

            <span>${match.match}</span>

        </div>

        `;

    });

}
/* ==========================================================
DRAWS
========================================================== */

async function loadDraws(){

    const bracket = document.querySelector(".draw-bracket");
    if(!bracket) return;

    try {
        const bracketResponse = await fetch("data/draw-bracket.json", { cache: "no-store" });
        if (!bracketResponse.ok) {
            throw new Error("No se pudo cargar draw-bracket.json");
        }

        const bracketData = await bracketResponse.json();
        const storedState = localStorage.getItem("drawBracketState");
        const parsedState = storedState ? JSON.parse(storedState) : null;
        const activeBracket = parsedState?.rounds ? parsedState : bracketData;

        normalizeBracket(activeBracket);

        autoAdvanceBracket(activeBracket);

        const firstRoundCount = bracketData.rounds[0]?.matches?.length || 0;
        const mobile = window.matchMedia("(max-width: 600px)").matches;
        const matchHeight = mobile ? 50 : 112;
        const matchStep = mobile ? 58 : 132;
        const roundHeight = Math.max(
            mobile ? 760 : 1980,
            (Math.max(firstRoundCount - 1, 0) * matchStep) + matchHeight
        );

        bracket.style.setProperty("--round-height", `${roundHeight}px`);
        bracket.style.setProperty("--match-height", `${matchHeight}px`);
        bracket.innerHTML = "";

        activeBracket.rounds.forEach((round, index) => {
            const roundCol = document.createElement("div");
            roundCol.className = "draw-round";
            roundCol.classList.add(`draw-round-${index + 1}`);

            roundCol.innerHTML = `
                <div class="draw-round-title">${round.title}</div>
                <div class="draw-round-matches"></div>
            `;

            const matchHost = roundCol.querySelector(".draw-round-matches");

            round.matches.forEach((match, matchIndex) => {
                const card = document.createElement("div");
                card.className = "draw-match";

                const factor = 2 ** index;
                const top = ((factor * matchIndex) + ((factor - 1) / 2)) * matchStep;
                card.style.top = `${Math.round(top)}px`;

                const p1Sets = countSetsWon(match.games, "p1");
                const p2Sets = countSetsWon(match.games, "p2");
                const gameCells1 = renderGameCells(match.games, "p1");
                const gameCells2 = renderGameCells(match.games, "p2");
                const footerDate = match.date || "-";

                card.innerHTML = `
                    <div class="draw-player ${isMutedPlayer(match.p1.name) ? "is-muted" : ""}">
                        <div class="draw-player-main">
                            <span class="draw-avatar-wrap">
                                ${match.p1.image ? `<img class="draw-avatar" src="assets/images/players/${match.p1.image}" alt="${match.p1.name}">` : ""}
                            </span>
                            <span class="draw-player-name">${match.p1.name}</span>
                        </div>
                        <div class="draw-scoreline">
                            <span class="draw-sets-won">${p1Sets}</span>
                            ${gameCells1}
                        </div>
                    </div>
                    <div class="draw-player ${isMutedPlayer(match.p2.name) ? "is-muted" : ""}">
                        <div class="draw-player-main">
                            <span class="draw-avatar-wrap">
                                ${match.p2.image ? `<img class="draw-avatar" src="assets/images/players/${match.p2.image}" alt="${match.p2.name}">` : ""}
                            </span>
                            <span class="draw-player-name">${match.p2.name}</span>
                        </div>
                        <div class="draw-scoreline">
                            <span class="draw-sets-won">${p2Sets}</span>
                            ${gameCells2}
                        </div>
                    </div>
                    <div class="draw-match-footer">
                        <span class="draw-match-date">${footerDate}</span>
                    </div>
                `;

                matchHost.appendChild(card);
            });

            bracket.appendChild(roundCol);
        });
    } catch (error) {
        console.error("Error cargando bracket:", error);
        bracket.innerHTML = '<p class="draw-error">No se pudo cargar el cuadro.</p>';
    }

}

function isMutedPlayer(name){

    return name === "TBD" || name === "BYE" || !name;

}

function normalizeBracket(bracket){

    bracket.rounds.forEach((round) => {
        round.matches.forEach((match) => {
            if(!match.p1) match.p1 = { name: "TBD" };
            if(!match.p2) match.p2 = { name: "TBD" };
            if(!Array.isArray(match.games)){
                match.games = Array.from({ length: 5 }, () => ({ p1: null, p2: null }));
            }
            if(match.games.length < 5){
                const missing = 5 - match.games.length;
                for(let i = 0; i < missing; i += 1){
                    match.games.push({ p1: null, p2: null });
                }
            }
        });
    });

}

function autoAdvanceBracket(bracket){

    for(let roundIndex = 1; roundIndex < bracket.rounds.length; roundIndex += 1){
        bracket.rounds[roundIndex].matches.forEach((match) => {
            match.p1 = { name: "TBD" };
            match.p2 = { name: "TBD" };
        });
    }

    for(let roundIndex = 0; roundIndex < bracket.rounds.length - 1; roundIndex += 1){
        const currentRound = bracket.rounds[roundIndex];
        const nextRound = bracket.rounds[roundIndex + 1];

        currentRound.matches.forEach((match, matchIndex) => {
            const winner = getMatchWinner(match);
            if(!winner) return;

            const nextMatchIndex = Math.floor(matchIndex / 2);
            const targetSlot = matchIndex % 2 === 0 ? "p1" : "p2";

            if(nextRound.matches[nextMatchIndex]){
                nextRound.matches[nextMatchIndex][targetSlot] = {
                    name: winner.name,
                    image: winner.image || null
                };
            }
        });
    }

}

function getMatchWinner(match){

    if(match.p1?.name === "BYE" && !isMutedPlayer(match.p2?.name)) return match.p2;
    if(match.p2?.name === "BYE" && !isMutedPlayer(match.p1?.name)) return match.p1;
    if(isMutedPlayer(match.p1?.name) || isMutedPlayer(match.p2?.name)) return null;

    const p1Sets = countSetsWon(match.games, "p1");
    const p2Sets = countSetsWon(match.games, "p2");

    if(p1Sets === p2Sets) return null;

    return p1Sets > p2Sets ? match.p1 : match.p2;

}

function countSetsWon(games, side){

    const sideKey = side === "p1" ? "p1" : "p2";
    const oppKey = side === "p1" ? "p2" : "p1";

    return games.reduce((sum, game) => {
        const mine = toValidScore(game?.[sideKey]);
        const opp = toValidScore(game?.[oppKey]);

        if(mine === null || opp === null) return sum;

        return mine > opp ? sum + 1 : sum;
    }, 0);

}

function toValidScore(value){

    if(value === null || value === undefined || value === "") return null;

    const num = Number(value);
    return Number.isFinite(num) ? num : null;

}

function renderGameCells(games, side){

    const key = side === "p1" ? "p1" : "p2";

    return games.slice(0, 5).map((game) => {
        const score = toValidScore(game?.[key]);
        return `<span class="draw-game-score">${score === null ? "-" : score}</span>`;
    }).join("");

}

function loadTournamentCenter(){

    document.getElementById("liveNow").innerHTML =
    "No hay partidos en directo";

    document.getElementById("todayMatches").innerHTML =
    "No hay partidos programados";

    document.getElementById("latestResults").innerHTML =
    "Sin resultados";

    document.getElementById("nextMatches").innerHTML =
    "Sin próximos partidos";

}

function extractYouTubeVideoId(url) {

    if (!url) return null;

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

        if (host === "youtu.be") {
            return parsed.pathname.split("/").filter(Boolean)[0] || null;
        }

        if (host.endsWith("youtube.com")) {
            if (parsed.searchParams.get("v")) {
                return parsed.searchParams.get("v");
            }

            const pathParts = parsed.pathname.split("/").filter(Boolean);
            const marker = pathParts[0];
            if (["embed", "shorts", "live"].includes(marker) && pathParts[1]) {
                return pathParts[1];
            }
        }
    } catch (error) {
        return null;
    }

    return null;

}

function initLiveStream() {

    const videoContainer = document.querySelector("#live .live-video");
    const archivePanel = document.getElementById("liveArchivePanel");
    const archiveGrid = document.getElementById("liveArchiveGrid");
    if (!videoContainer) return;

    const history = readLiveHistory();
    const validHistory = history.filter((item) => item?.url && extractYouTubeVideoId(item.url));
    const currentItem = validHistory.length ? validHistory[validHistory.length - 1] : null;

    if (currentItem?.url) {
        renderLivePlayer(videoContainer, currentItem.url);
    }

    if (history.length === 0) {
        if (archivePanel) archivePanel.hidden = false;
        if (archiveGrid) {
            archiveGrid.innerHTML = '<p class="live-archive-empty">Todavía no hay directos anteriores.</p>';
        }
        return;
    }

    if (!archivePanel || !archiveGrid) return;

    const previous = validHistory.slice(0, -1);
    if (previous.length === 0) {
        archivePanel.hidden = false;
        archiveGrid.innerHTML = '<p class="live-archive-empty">Todavía no hay directos anteriores.</p>';
        return;
    }

    archivePanel.hidden = false;
    archiveGrid.innerHTML = previous.map((item) => {
        const id = extractYouTubeVideoId(item.url);
        if (!id) return "";
        const thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
        const title = escapeHtml(item.title || "Directo anterior");
        const safeUrl = escapeHtml(item.url);
        return `
            <a class="live-archive-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer" aria-label="${title}">
                <img class="live-archive-thumb" src="${thumb}" alt="${title}">
                <div class="live-archive-meta">${title}</div>
            </a>
        `;
    }).join("");

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

        const urls = parsed
            .map((value) => {
                if (typeof value === "string") {
                    const url = value.trim();
                    if (!url || !extractYouTubeVideoId(url)) return null;
                    return { url, title: "Directo", createdAt: new Date().toISOString() };
                }

                if (value && typeof value === "object") {
                    const url = String(value.url || "").trim();
                    if (!url || !extractYouTubeVideoId(url)) return null;
                    return {
                        url,
                        title: String(value.title || "Directo").trim() || "Directo",
                        createdAt: value.createdAt || new Date().toISOString()
                    };
                }

                return null;
            })
            .filter(Boolean);

        if (urls.length === 0 && current) {
            return [{ url: current, title: "Directo", createdAt: new Date().toISOString() }];
        }

        return urls;
    } catch (error) {
        const current = (localStorage.getItem(LIVE_STREAM_URL_KEY) || "").trim();
        return current ? [{ url: current, title: "Directo", createdAt: new Date().toISOString() }] : [];
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderLivePlayer(container, streamUrl) {
    const videoId = extractYouTubeVideoId(streamUrl);
    if (!videoId) return;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

    container.innerHTML = `
        <iframe
            src="${embedUrl}"
            title="PSA Valencia Open Live"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
    `;
}

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

function formatNewsDate(value, lang) {
    const dt = new Date(value || Date.now());
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(lang === "va" ? "ca-ES" : lang, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function normalizeNewsItem(item) {
    const article = item?.article || item?.summary || "";
    return {
        id: item?.id || `news_${Math.random().toString(36).slice(2, 8)}`,
        imageSrc: item?.imageSrc || item?.image || "",
        title: normalizeLocalizedText(item?.title),
        article: normalizeLocalizedText(article),
        createdAt: item?.createdAt || new Date().toISOString()
    };
}

function readNewsCollection() {
    try {
        const raw = localStorage.getItem(NEWS_COLLECTION_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.map(normalizeNewsItem).sort((a, b) => {
            const ta = Date.parse(a?.createdAt || "") || 0;
            const tb = Date.parse(b?.createdAt || "") || 0;
            return tb - ta;
        });
    } catch (error) {
        return [];
    }
}

function normalizeGalleryItem(item) {
    const photos = Array.isArray(item?.photos) ? item.photos : [];
    return {
        id: item?.id || `gallery_${Math.random().toString(36).slice(2, 8)}`,
        title: normalizeLocalizedText(item?.title),
        photos: photos.map((photo) => ({
            id: photo?.id || `photo_${Math.random().toString(36).slice(2, 8)}`,
            src: photo?.src || "",
            caption: normalizeLocalizedText(photo?.caption)
        })).filter((photo) => !!photo.src),
        createdAt: item?.createdAt || new Date().toISOString()
    };
}

function readGalleryCollection() {

    try {
        const raw = localStorage.getItem(GALLERY_COLLECTION_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.map(normalizeGalleryItem).sort((a, b) => {
            const ta = Date.parse(a?.createdAt || "") || 0;
            const tb = Date.parse(b?.createdAt || "") || 0;
            return ta - tb;
        });
    } catch (error) {
        return [];
    }

}

function loadHomeGallery() {

    const grid = document.getElementById("galleryHomeGrid");
    if (!grid) return;

    const galleries = readGalleryCollection();
    const lang = getCurrentLanguage();
    const photosWord = {
        es: "fotos",
        va: "fotos",
        en: "photos",
        fr: "photos"
    };

    if (galleries.length === 0) {
        grid.innerHTML = '<p class="gallery-empty">Todavia no hay galerias publicadas.</p>';
        return;
    }

    grid.innerHTML = "";

    galleries.forEach((gallery) => {
        const photos = Array.isArray(gallery.photos) ? gallery.photos : [];
        if (photos.length === 0) return;

        const cover = photos[0];
        const card = document.createElement("a");
        card.className = "gallery-home-card";
        card.href = `gallery.html?galleryId=${encodeURIComponent(gallery.id)}`;

        const title = getLocalizedText(gallery.title, lang) || "Galería";

        card.innerHTML = `
            <div class="gallery-home-thumb">
                <img src="${cover.src}" alt="${title}">
            </div>
            <div class="gallery-home-info">
                <div class="gallery-home-title">${title}</div>
                <div class="gallery-home-count">${photos.length} ${photosWord[lang] || photosWord.es}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    if (!grid.innerHTML.trim()) {
        grid.innerHTML = '<p class="gallery-empty">Todavia no hay galerias publicadas.</p>';
    }

}