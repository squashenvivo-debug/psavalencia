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
const SPONSORS_COLLECTION_KEY = "sponsorsCollection";
const PLAYERS_COLLECTION_KEY = "playersCollection";
const HERO_SETTINGS_KEY = "heroSettings";
const TOURNAMENT_MODE_KEY = "tournamentContentMode";
const TOURNAMENT_API_URL_KEY = "tournamentApiUrl";
const TOURNAMENT_MANUAL_CONTENT_KEY = "tournamentManualContent";
const DRAW_BRACKET_KEY = "drawBracketState";
const DYNAMIC_LANGS = ["es", "va", "en", "fr"];
let countdownTimerId = null;
const CLOUD_PUBLIC_KEYS = [
    LIVE_STREAM_URL_KEY,
    LIVE_STREAM_HISTORY_KEY,
    GALLERY_COLLECTION_KEY,
    NEWS_COLLECTION_KEY,
    SPONSORS_COLLECTION_KEY,
    PLAYERS_COLLECTION_KEY,
    HERO_SETTINGS_KEY,
    TOURNAMENT_MODE_KEY,
    TOURNAMENT_API_URL_KEY,
    TOURNAMENT_MANUAL_CONTENT_KEY,
    DRAW_BRACKET_KEY
];

document.addEventListener("DOMContentLoaded", async () => {

    await syncPublicStateFromCloud();

    await loadConfig();

    applyHeroSettings();

    initHeader();

    initCountdown();

    revealSections();

    await loadPlayers();
    loadSponsors();

    initLiveStream();
    loadHomeGallery();

    await loadNews();
await loadSchedule();
await loadDraws();
loadTournamentCenter();

    document.addEventListener("app-language-changed", () => {
        applyHeroSettings();
        initCountdown();
        initLiveStream();
        loadHomeGallery();
        loadNews();
    });
});

async function syncPublicStateFromCloud() {
    const cloud = window.PSACloudStore;
    if (!cloud?.isReady?.()) return;

    await cloud.syncLocalStorageFromCloud(CLOUD_PUBLIC_KEYS);
}

function readHeroSettings() {
    try {
        const raw = localStorage.getItem(HERO_SETTINGS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;

        return {
            eventLabel: parsed?.eventLabel || null,
            eventTitle: parsed?.eventTitle || null,
            eventLocation: parsed?.eventLocation || null,
            countdownDate: String(parsed?.countdownDate || "").trim(),
            backgroundImage: String(parsed?.backgroundImage || "").trim()
        };
    } catch (error) {
        return null;
    }
}

function resolveDynamicImage(pathValue, folder) {
    const raw = String(pathValue || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:")) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.includes("/")) return raw;
    return `${folder}/${raw}`;
}

function getLocalizedHeroText(value, lang) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return String(value?.[lang] || value?.es || value?.va || value?.en || value?.fr || "").trim();
    }
    return "";
}

function applyHeroSettings() {
    const heroSettings = readHeroSettings();
    if (!heroSettings) return;

    const lang = getCurrentLanguage();

    const label = getLocalizedHeroText(heroSettings.eventLabel, lang);
    const title = getLocalizedHeroText(heroSettings.eventTitle, lang);
    const location = getLocalizedHeroText(heroSettings.eventLocation, lang);

    const labelEl = document.querySelector("#hero .event-label");
    const titleEl = document.querySelector("#hero .event-title");
    const locationEl = document.querySelector("#hero .event-location");
    const heroBgImage = document.querySelector("#hero .hero-background img");

    if (labelEl && label) labelEl.textContent = label;
    if (titleEl && title) titleEl.textContent = title;
    if (locationEl && location) locationEl.textContent = location;

    if (heroBgImage && heroSettings.backgroundImage) {
        const src = resolveDynamicImage(heroSettings.backgroundImage, "assets/images/hero");
        if (src) {
            heroBgImage.src = src;
        }
    }
}


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

    const heroSettings = readHeroSettings();
    const fallback = "2026-08-11T10:00:00";
    const targetDateRaw = heroSettings?.countdownDate || fallback;
    const parsedTargetDate = new Date(targetDateRaw).getTime();
    const targetDate = Number.isFinite(parsedTargetDate)
        ? parsedTargetDate
        : new Date(fallback).getTime();

    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");

    if (!days) return;

    function updateCountdown() {

        const now = new Date().getTime();

        const distance = targetDate - now;

        if (distance <= 0) {
            days.textContent = "00";
            hours.textContent = "00";
            minutes.textContent = "00";
            seconds.textContent = "00";
            return;
        }

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

    if (countdownTimerId) {
        clearInterval(countdownTimerId);
    }

    countdownTimerId = setInterval(updateCountdown, 1000);

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

        const customPlayers = readPlayersCollection();
        let players = customPlayers;

        if (!Array.isArray(players) || players.length === 0) {
            let response = await fetch("data/players.json", { cache: "no-store" });

            if (!response.ok) {
                response = await fetch("data/translations/players.json", { cache: "no-store" });
            }

            if (!response.ok) {
                throw new Error("No se pudo cargar data/players.json ni data/translations/players.json");
            }

            players = await response.json();
        }

        grid.innerHTML = "";

        players.forEach(player => {

            const seedBadge = player.seed
                ? `<span class="player-seed">${player.seed}</span>`
                : `<span class="player-seed player-seed-empty">seed</span>`;

            const positionStyle = player.photoPosition
                ? ` style="object-position:${player.photoPosition};"`
                : "";

            const imageSrc = resolvePlayerImageSrc(player.image || player.imageSrc || "");

            grid.innerHTML += `

                <article class="player-card">

                    <div class="player-photo">
                        <img src="${imageSrc}" alt="${player.name}"${positionStyle}>
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

function resolvePlayerImageSrc(image) {
    const value = String(image || "").trim();
    if (!value) return "";
    if (value.startsWith("data:")) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.includes("/")) return value;
    return `assets/images/players/${value}`;
}

function readPlayersCollection() {
    try {
        const raw = localStorage.getItem(PLAYERS_COLLECTION_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;

        return parsed
            .map((player) => ({
                name: String(player?.name || "").trim(),
                country: String(player?.country || "").trim().toUpperCase(),
                ranking: Number(player?.ranking) || "",
                image: String(player?.image || player?.imageSrc || "").trim(),
                seed: String(player?.seed || "").trim(),
                photoPosition: String(player?.photoPosition || "").trim()
            }))
            .filter((player) => player.name && player.country && player.image);
    } catch (error) {
        return null;
    }
}

function readSponsorsCollection() {
    try {
        const raw = localStorage.getItem(SPONSORS_COLLECTION_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;

        return parsed
            .map((sponsor) => ({
                name: String(sponsor?.name || "Sponsor").trim() || "Sponsor",
                link: String(sponsor?.link || sponsor?.href || "#").trim() || "#",
                imageSrc: String(sponsor?.imageSrc || sponsor?.src || "").trim(),
                cardClass: String(sponsor?.cardClass || "sponsor-card").trim() || "sponsor-card"
            }))
            .filter((sponsor) => !!sponsor.imageSrc);
    } catch (error) {
        return null;
    }
}

function resolveSponsorImageSrc(image) {
    const value = String(image || "").trim();
    if (!value) return "";
    if (value.startsWith("data:")) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.includes("/")) return value;
    return `assets/images/sponsors/${value}`;
}

function loadSponsors() {
    const grid = document.querySelector("#sponsors .sponsors-grid");
    if (!grid) return;

    const sponsors = readSponsorsCollection();
    if (!sponsors) {
        return;
    }

    if (sponsors.length === 0) {
        // Si la colección dinámica está vacía, mantenemos los sponsors base del HTML.
        return;
    }

    grid.innerHTML = sponsors.map((sponsor) => {
        const imageSrc = resolveSponsorImageSrc(sponsor.imageSrc);
        const safeName = escapeHtml(sponsor.name || "Sponsor");
        const safeLink = escapeHtml(sponsor.link || "#");
        const classes = escapeHtml(sponsor.cardClass || "sponsor-card");

        return `<a class="${classes}" href="${safeLink}" target="_blank" rel="noopener noreferrer"><img src="${imageSrc}" alt="${safeName}"></a>`;
    }).join("");
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

                const p1Muted = isMutedPlayer(match.p1.name);
                const p2Muted = isMutedPlayer(match.p2.name);
                const hasPlayedGames = hasAnyPlayedGame(match.games);
                const p1Sets = (!hasPlayedGames || p1Muted) ? "" : countSetsWon(match.games, "p1");
                const p2Sets = (!hasPlayedGames || p2Muted) ? "" : countSetsWon(match.games, "p2");
                const gameCells1 = renderGameCells(match.games, "p1");
                const gameCells2 = renderGameCells(match.games, "p2");
                const footerDate = match.date || "-";

                card.innerHTML = `
                    <div class="draw-player ${p1Muted ? "is-muted" : ""}">
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
                    <div class="draw-player ${p2Muted ? "is-muted" : ""}">
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
        return `<span class="draw-game-score">${score === null ? "" : score}</span>`;
    }).join("");

}

function hasAnyPlayedGame(games){

    return (games || []).some((game) => {
        const p1 = toValidScore(game?.p1);
        const p2 = toValidScore(game?.p2);
        return p1 !== null || p2 !== null;
    });

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
