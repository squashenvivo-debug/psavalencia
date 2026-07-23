/* ==========================================================
   PSA VALENCIA OPEN
   app.js
========================================================== */

/* ==========================================================
   INICIO
========================================================== */
let CONFIG = {};

document.addEventListener("DOMContentLoaded", async () => {

    await loadConfig();

    initHeader();

    initCountdown();

    revealSections();

    await loadPlayers();

    await loadNews();
await loadSchedule();
await loadDraws();
loadTournamentCenter();
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
                : "";

            grid.innerHTML += `

                <article class="player-card">

                    <img src="assets/images/players/${player.image}" alt="${player.name}">

                    <div class="player-info">

                        <img class="player-flag"
                             src="assets/images/flags/${player.country}.png"
                             alt="${player.country}">

                            <h3>${player.name} ${seedBadge}</h3>

                        <p>World Nº ${player.ranking}</p>

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

        const response = await fetch("data/news.json");
        const news = await response.json();

        grid.innerHTML = "";

        news.forEach(item => {

            grid.innerHTML += `

                <article class="news-card">

                    <img src="assets/images/news/${item.image}" alt="${item.title}">

                    <div class="news-content">

                        <span class="news-date">${item.date}</span>

                        <h3>${item.title}</h3>

                        <p>${item.summary}</p>

                        <a href="#" class="btn btn-primary">

                            Leer más

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

    const grid=document.querySelector(".draw-grid");

    if(!grid) return;

    const response=await fetch("data/draws.json");

    const draws=await response.json();

    grid.innerHTML="";

    draws.forEach(draw=>{

        grid.innerHTML+=`

        <div class="draw-card">

            <h3>${draw.title}</h3>

            <p>

                Última actualización:

                ${draw.updated}

            </p>

            <a

            href="assets/pdf/${draw.file}"

            target="_blank"

            class="btn btn-primary">

            Abrir PDF

            </a>

        </div>

        `;

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