/* ==========================================================
   LANGUAGE.JS
   PSA VALENCIA OPEN
========================================================== */

const translations = {

    es: {

        menu: {
            home: "Inicio",
            tournament: "Torneo",
            players: "Jugadores",
            schedule: "Horarios",
            draw: "Cuadros",
            live: "Directo",
            news: "Noticias",
            gallery: "Galería",
            venue: "Sede"
        },

        hero: {
            
    live: "VER DIRECTO",
    draw: "CUADROS",
    days: "DÍAS",
    hours: "HORAS",
    minutes: "MIN",
    seconds: "SEG"
},
quick: {

    live: {
        title: "DIRECTO",
        text: "Ver los partidos en vivo"
    },

    draw: {
        title: "CUADROS",
        text: "Resultados y enfrentamientos"
    },

    schedule: {
        title: "HORARIOS",
        text: "Orden de juego del torneo"
    },

    players: {
        title: "JUGADORES",
        text: "Conoce a todos los participantes"
    }

},

    },

    va: {

        menu: {
            home: "Inici",
            tournament: "Torneig",
            players: "Jugadors",
            schedule: "Horaris",
            draw: "Quadres",
            live: "Directe",
            news: "Notícies",
            gallery: "Galeria",
            venue: "Seu"
        },

        hero: {
    live: "VEURE DIRECTE",
    draw: "QUADRES",
    days: "DIES",
    hours: "HORES",
    minutes: "MIN",
    seconds: "SEG"
},
quick: {

    live: {
        title: "DIRECTE",
        text: "Veure els partits en directe"
    },

    draw: {
        title: "QUADRES",
        text: "Resultats i enfrontaments"
    },

    schedule: {
        title: "HORARIS",
        text: "Ordre de joc del torneig"
    },

    players: {
        title: "JUGADORS",
        text: "Coneix tots els participants"
    }

},
    },

    en: {

        menu: {
            home: "Home",
            tournament: "Tournament",
            players: "Players",
            schedule: "Schedule",
            draw: "Draws",
            live: "Live",
            news: "News",
            gallery: "Gallery",
            venue: "Venue"
        },

hero: {
    live: "WATCH LIVE",
    draw: "DRAWS",
    days: "DAYS",
    hours: "HOURS",
    minutes: "MIN",
    seconds: "SEC"
},
quick: {

    live: {
        title: "LIVE",
        text: "Watch matches live"
    },

    draw: {
        title: "DRAWS",
        text: "Results and matchups"
    },

    schedule: {
        title: "SCHEDULE",
        text: "Order of play"
    },

    players: {
        title: "PLAYERS",
        text: "Meet all participants"
    }

},
    },

    fr: {

        menu: {
            home: "Accueil",
            tournament: "Tournoi",
            players: "Joueurs",
            schedule: "Programme",
            draw: "Tableaux",
            live: "Direct",
            news: "Actualités",
            gallery: "Galerie",
            venue: "Lieu"
        },

hero: {
    live: "DIRECT",
    draw: "TABLEAUX",
    days: "JOURS",
    hours: "HEURES",
    minutes: "MIN",
    seconds: "SEC"
},
quick: {

    live: {
        title: "DIRECT",
        text: "Regarder les matchs en direct"
    },

    draw: {
        title: "TABLEAUX",
        text: "Résultats et confrontations"
    },

    schedule: {
        title: "PROGRAMME",
        text: "Ordre des matchs"
    },

    players: {
        title: "JOUEURS",
        text: "Découvrez tous les participants"
    }

},

    }

};

/* Textos de todas las secciones estáticas de la página. */
const pageTranslations = {
    es: {
        menu: { discover: "Conoce Valencia", sponsors: "Patrocinadores" },
        event: { label: "MEMORIAL", title: "CHIMO MARMANEAU", location: "Alboraya · Valencia" },
        tournament: { kicker: "PSA WORLD TOUR COPPER", title: "Torneo", intro: "Descubre todo sobre el PSA Valencia Open 2026 – Memorial Chimo Marmaneu." },
        live: { title: "EN DIRECTO", videoTitle: "Streaming PSA Valencia Open", videoIntro: "Aquí aparecerá el reproductor de YouTube.", court1: "PISTA 1", court2: "PISTA 2", upcoming: "Próximamente", pending: "Partido pendiente" },
        sections: { players: "JUGADORES DESTACADOS", schedule: "HORARIOS", draw: "CUADROS", news: "NOTICIAS", gallery: "GALERÍA" },
        venue: { title: "SEDE DEL TORNEO", intro: "Olympia Hotel, Events & Spa será la sede oficial del PSA Valencia Open · Memorial Chimo Marmaneu.", address: "Dirección", phone: "Teléfono", directions: "Cómo llegar", parking: "🅿 Parking", cafe: "☕ Cafetería", restaurant: "🍴 Restaurante", accessible: "♿ Accesible", changing: "🚿 Vestuarios" },
        discover: { label: "VALENCIA", title: "DESCUBRE LA CIUDAD", intro: "Mucho más que squash. Descubre una de las ciudades más atractivas del Mediterráneo durante tu estancia.", arts: "Ciudad de las Artes y las Ciencias", artsText: "El icono arquitectónico de Valencia.", beach: "Playa de la Malvarrosa", beachText: "A pocos minutos de Olympia.", centre: "Centro histórico", centreText: "Historia, cultura y tradición.", food: "Gastronomía valenciana", foodText: "La auténtica paella valenciana." },
        sponsors: { title: "PATROCINADORES", intro: "Gracias a nuestros patrocinadores por hacer posible el PSA Valencia Open 2026." },
        footer: { copyright: "© 2026 PSA Valencia Open · Memorial Chimo Marmaneu" }
    },
    va: {
        menu: { discover: "Coneix València", sponsors: "Patrocinadors" },
        event: { label: "MEMORIAL", title: "CHIMO MARMANEAU", location: "Alboraia · València" },
        tournament: { kicker: "PSA WORLD TOUR COPPER", title: "Torneig", intro: "Descobreix tot sobre el PSA Valencia Open 2026 – Memorial Chimo Marmaneu." },
        live: { title: "EN DIRECTE", videoTitle: "Retransmissió PSA Valencia Open", videoIntro: "Ací apareixerà el reproductor de YouTube.", court1: "PISTA 1", court2: "PISTA 2", upcoming: "Pròximament", pending: "Partit pendent" },
        sections: { players: "JUGADORS DESTACATS", schedule: "HORARIS", draw: "QUADRES", news: "NOTÍCIES", gallery: "GALERIA" },
        venue: { title: "SEU DEL TORNEIG", intro: "Olympia Hotel, Events & Spa serà la seu oficial del PSA Valencia Open · Memorial Chimo Marmaneu.", address: "Adreça", phone: "Telèfon", directions: "Com arribar", parking: "🅿 Aparcament", cafe: "☕ Cafeteria", restaurant: "🍴 Restaurant", accessible: "♿ Accessible", changing: "🚿 Vestidors" },
        discover: { label: "VALÈNCIA", title: "DESCOBREIX LA CIUTAT", intro: "Molt més que esquaix. Descobreix una de les ciutats més atractives de la Mediterrània durant la teua estada.", arts: "Ciutat de les Arts i les Ciències", artsText: "La icona arquitectònica de València.", beach: "Platja de la Malva-rosa", beachText: "A pocs minuts d'Olympia.", centre: "Centre històric", centreText: "Història, cultura i tradició.", food: "Gastronomia valenciana", foodText: "L'autèntica paella valenciana." },
        sponsors: { title: "PATROCINADORS", intro: "Gràcies als nostres patrocinadors per fer possible el PSA Valencia Open 2026." },
        footer: { copyright: "© 2026 PSA Valencia Open · Memorial Chimo Marmaneu" }
    },
    en: {
        menu: { discover: "Discover Valencia", sponsors: "Sponsors" },
        event: { label: "MEMORIAL", title: "CHIMO MARMANEAU", location: "Alboraya · Valencia" },
        tournament: { kicker: "PSA WORLD TOUR COPPER", title: "Tournament", intro: "Discover everything about the PSA Valencia Open 2026 – Memorial Chimo Marmaneu." },
        live: { title: "LIVE", videoTitle: "PSA Valencia Open streaming", videoIntro: "The YouTube player will appear here.", court1: "COURT 1", court2: "COURT 2", upcoming: "Coming soon", pending: "Match pending" },
        sections: { players: "FEATURED PLAYERS", schedule: "SCHEDULE", draw: "DRAWS", news: "NEWS", gallery: "GALLERY" },
        venue: { title: "TOURNAMENT VENUE", intro: "Olympia Hotel, Events & Spa will be the official venue for the PSA Valencia Open · Memorial Chimo Marmaneu.", address: "Address", phone: "Phone", directions: "Get directions", parking: "🅿 Parking", cafe: "☕ Café", restaurant: "🍴 Restaurant", accessible: "♿ Accessible", changing: "🚿 Changing rooms" },
        discover: { label: "VALENCIA", title: "DISCOVER THE CITY", intro: "Much more than squash. Discover one of the Mediterranean's most attractive cities during your stay.", arts: "City of Arts and Sciences", artsText: "Valencia's architectural icon.", beach: "Malvarrosa Beach", beachText: "Just minutes from Olympia.", centre: "Historic centre", centreText: "History, culture and tradition.", food: "Valencian cuisine", foodText: "Authentic Valencian paella." },
        sponsors: { title: "SPONSORS", intro: "Thank you to our sponsors for making the PSA Valencia Open 2026 possible." },
        footer: { copyright: "© 2026 PSA Valencia Open · Memorial Chimo Marmaneu" }
    },
    fr: {
        menu: { discover: "Découvrir Valence", sponsors: "Sponsors" },
        event: { label: "MÉMORIAL", title: "CHIMO MARMANEAU", location: "Alboraia · Valence" },
        tournament: { kicker: "PSA WORLD TOUR COPPER", title: "Tournoi", intro: "Découvrez tout sur le PSA Valencia Open 2026 – Memorial Chimo Marmaneu." },
        live: { title: "EN DIRECT", videoTitle: "Diffusion PSA Valencia Open", videoIntro: "Le lecteur YouTube apparaîtra ici.", court1: "COURT 1", court2: "COURT 2", upcoming: "Prochainement", pending: "Match en attente" },
        sections: { players: "JOUEURS À L'HONNEUR", schedule: "PROGRAMME", draw: "TABLEAUX", news: "ACTUALITÉS", gallery: "GALERIE" },
        venue: { title: "LIEU DU TOURNOI", intro: "Olympia Hotel, Events & Spa sera le lieu officiel du PSA Valencia Open · Memorial Chimo Marmaneu.", address: "Adresse", phone: "Téléphone", directions: "Itinéraire", parking: "🅿 Parking", cafe: "☕ Cafétéria", restaurant: "🍴 Restaurant", accessible: "♿ Accessible", changing: "🚿 Vestiaires" },
        discover: { label: "VALENCE", title: "DÉCOUVRIR LA VILLE", intro: "Bien plus que le squash. Découvrez l'une des villes les plus attrayantes de la Méditerranée pendant votre séjour.", arts: "Cité des Arts et des Sciences", artsText: "L'icône architecturale de Valence.", beach: "Plage de la Malvarrosa", beachText: "À quelques minutes d'Olympia.", centre: "Centre historique", centreText: "Histoire, culture et tradition.", food: "Gastronomie valencienne", foodText: "L'authentique paella valencienne." },
        sponsors: { title: "PARTENAIRES", intro: "Merci à nos partenaires de rendre possible le PSA Valencia Open 2026." },
        footer: { copyright: "© 2026 PSA Valencia Open · Memorial Chimo Marmaneu" }
    }
};

Object.entries(pageTranslations).forEach(([lang, content]) => {
    const { menu, ...sections } = content;
    Object.assign(translations[lang], sections);
    Object.assign(translations[lang].menu, menu);
});

const languageNames = {

    es: "ES",

    va: "VA",

    en: "EN",

    fr: "FR"

};

let currentLanguage =
localStorage.getItem("language") || "es";

const TOURNAMENT_MODE_KEY = "tournamentContentMode";
const TOURNAMENT_API_URL_KEY = "tournamentApiUrl";

const tournamentIntroByLanguage = {
        es: `
<article class="tournament-article">
    <div class="tournament-card">
        <header class="tournament-header">
            <h3>!Bienvenidos al PSA Valencia 2026 - Memorial Chimo Marmaneu!</h3>
            <p>Valencia se convierte de nuevo en el epicentro del squash internacional.</p>
        </header>
        <section class="tournament-content">
            <p>Del <strong>11 al 15 de agosto de 2026</strong>, nuestra ciudad acogera el <strong>PSA Valencia 2026 - Memorial Chimo Marmaneu</strong>, una cita imprescindible dentro del calendario de la Asociacion Profesional de Squash (PSA).</p>
            <p>Este ano, el torneo da un salto historico de categoria al consolidarse como un evento <strong>PSA World Tour Copper</strong> en la modalidad masculina. Con una atractiva bolsa de premios de <strong>36.000 dolares</strong>, atraera a varias de las mejores raquetas del planeta, garantizando un espectaculo deportivo del mas alto nivel, una intensidad fisica inigualable y puntos cruciales para el ranking mundial.</p>
            <section class="tournament-history">
                <h4>Nuestro legado: El camino hasta el World Tour</h4>
                <p>El PSA Valencia no es solo un torneo; es un homenaje al legado de nuestro deporte y una evolucion constante:</p>
                <ul>
                    <li><strong>Edicion 2025:</strong> El ano pasado, el torneo (en categoria Challenger 15K) corono al jugador espanol <strong>Iker Pajares</strong> como campeon indiscutible, levantando el trofeo sin ceder un solo juego.</li>
                    <li><strong>Consolidacion:</strong> Tras anos de exito organizativo, la confianza de la PSA y el apoyo de los aficionados han hecho posible el ascenso a la prestigiosa categoria <em>Copper</em>, situando a Valencia en el mapa mundial.</li>
                </ul>
            </section>
            <footer class="tournament-footer">
                <p class="lead">Preparate para vivir cinco dias de pura adrenalina, velocidad y estrategia.</p>
                <p>Sigue los partidos en directo en el club o vibra con la retransmision global a traves de <a href="https://squash.tv" target="_blank" rel="noopener">SquashTV</a>.</p>
            </footer>
        </section>
    </div>
</article>`,
        va: `
<article class="tournament-article">
    <div class="tournament-card">
        <header class="tournament-header">
            <h3>Benvinguts al PSA Valencia 2026 - Memorial Chimo Marmaneu!</h3>
            <p>Valencia es convertix de nou en l'epicentre del squash internacional.</p>
        </header>
        <section class="tournament-content">
            <p>Del <strong>11 al 15 d'agost de 2026</strong>, la nostra ciutat acollira el <strong>PSA Valencia 2026 - Memorial Chimo Marmaneu</strong>, una cita imprescindible dins del calendari de l'Associacio Professional de Squash (PSA).</p>
            <p>Enguany, el torneig fa un salt historic de categoria en consolidar-se com un esdeveniment <strong>PSA World Tour Copper</strong> en la modalitat masculina. Amb una atractiva bossa de premis de <strong>36.000 dolars</strong>, atraura algunes de les millors raquetes del planeta, garantint un espectacle del mes alt nivell.</p>
            <section class="tournament-history">
                <h4>El nostre llegat: El cami cap al World Tour</h4>
                <p>El PSA Valencia no es nomes un torneig; es un homenatge al llegat del nostre esport i una evolucio constant:</p>
                <ul>
                    <li><strong>Edicio 2025:</strong> L'any passat, el torneig (categoria Challenger 15K) va coronar el jugador espanyol <strong>Iker Pajares</strong> com a campio indiscutible.</li>
                    <li><strong>Consolidacio:</strong> Despres d'anys d'exit organitzatiu, la confianca de la PSA i el suport dels aficionats han fet possible l'ascens a la categoria <em>Copper</em>.</li>
                </ul>
            </section>
            <footer class="tournament-footer">
                <p class="lead">Prepara't per a viure cinc dies de pura adrenalina, velocitat i estrategia.</p>
                <p>Seguix els partits en directe al club o a traves de <a href="https://squash.tv" target="_blank" rel="noopener">SquashTV</a>.</p>
            </footer>
        </section>
    </div>
</article>`,
        en: `
<article class="tournament-article">
    <div class="tournament-card">
        <header class="tournament-header">
            <h3>Welcome to PSA Valencia 2026 - Memorial Chimo Marmaneu!</h3>
            <p>Valencia once again becomes the epicenter of international squash.</p>
        </header>
        <section class="tournament-content">
            <p>From <strong>August 11th to 15th, 2026</strong>, our city will host the <strong>PSA Valencia 2026 - Memorial Chimo Marmaneu</strong>, an essential stop on the Professional Squash Association (PSA) calendar.</p>
            <p>This year, the tournament reaches a historic milestone by upgrading to a <strong>PSA World Tour Copper</strong> men's event. With a prize purse of <strong>$36,000</strong>, it will bring top players together for elite-level performance, unmatched intensity and crucial ranking points.</p>
            <section class="tournament-history">
                <h4>Our Legacy: The Road to the World Tour</h4>
                <p>PSA Valencia is more than a tournament; it is a tribute to our sport and a story of constant growth:</p>
                <ul>
                    <li><strong>2025 Edition:</strong> Last year, as a Challenger 15K event, Spain's <strong>Iker Pajares</strong> claimed the title without dropping a single game.</li>
                    <li><strong>Consolidation:</strong> Years of organizational success, PSA trust and fan support made this promotion to the prestigious <em>Copper</em> category possible.</li>
                </ul>
            </section>
            <footer class="tournament-footer">
                <p class="lead">Get ready for five days of pure adrenaline, speed and strategy.</p>
                <p>Watch matches live at the club or worldwide on <a href="https://squash.tv" target="_blank" rel="noopener">SquashTV</a>.</p>
            </footer>
        </section>
    </div>
</article>`,
        fr: `
<article class="tournament-article">
    <div class="tournament-card">
        <header class="tournament-header">
            <h3>Bienvenue au PSA Valencia 2026 - Memorial Chimo Marmaneu!</h3>
            <p>Valence redevient le centre nevralgique du squash international.</p>
        </header>
        <section class="tournament-content">
            <p>Du <strong>11 au 15 aout 2026</strong>, notre ville accueillera le <strong>PSA Valencia 2026 - Memorial Chimo Marmaneu</strong>, un rendez-vous majeur du calendrier de la Professional Squash Association (PSA).</p>
            <p>Cette annee, le tournoi franchit un cap historique en rejoignant la categorie <strong>PSA World Tour Copper</strong> chez les hommes. Avec une dotation de <strong>36 000 dollars</strong>, l'evenement reunira des joueurs d'elite et des points precieux pour le classement mondial.</p>
            <section class="tournament-history">
                <h4>Notre heritage: Le chemin vers le World Tour</h4>
                <p>Le PSA Valencia est bien plus qu'un tournoi; c'est un hommage a l'histoire de notre sport et une evolution continue:</p>
                <ul>
                    <li><strong>Edition 2025:</strong> L'an dernier, en Challenger 15K, l'Espagnol <strong>Iker Pajares</strong> a ete sacre champion sans perdre un seul jeu.</li>
                    <li><strong>Consolidation:</strong> Le succes organisationnel, la confiance de la PSA et le soutien des supporters ont permis l'ascension vers la categorie <em>Copper</em>.</li>
                </ul>
            </section>
            <footer class="tournament-footer">
                <p class="lead">Preparez-vous a vivre cinq jours de pure adrenaline, vitesse et strategie.</p>
                <p>Suivez les matchs en direct au club ou a travers la diffusion mondiale sur <a href="https://squash.tv" target="_blank" rel="noopener">SquashTV</a>.</p>
            </footer>
        </section>
    </div>
</article>`
};

function getTournamentMode(){

    const mode = localStorage.getItem(TOURNAMENT_MODE_KEY);

    return mode === "api" ? "api" : "manual";

}

function getTournamentApiUrl(){

    return (localStorage.getItem(TOURNAMENT_API_URL_KEY) || "").trim();

}

function readTournamentApiResponse(payload, lang){

    if(!payload) return "";

    if(typeof payload === "string"){

        return payload;

    }

    if(typeof payload === "object"){

        return payload[lang]
            || payload.html
            || payload.content?.[lang]
            || payload.content
            || "";

    }

    return "";

}

async function fetchTournamentIntroFromApi(lang, apiUrl){

    const separator = apiUrl.includes("?") ? "&" : "?";

    const urlWithLang = `${apiUrl}${separator}lang=${encodeURIComponent(lang)}`;

    const response = await fetch(urlWithLang, { headers: { "Accept": "application/json, text/html" } });

    if(!response.ok){

        throw new Error(`API status ${response.status}`);

    }

    const contentType = response.headers.get("content-type") || "";

    if(contentType.includes("application/json")){

        const payload = await response.json();

        return readTournamentApiResponse(payload, lang);

    }

    return response.text();

}

async function renderTournamentIntro(lang){

    const container = document.getElementById("tournament-intro");
    if(!container) return;

    const manualHtml = tournamentIntroByLanguage[lang] || tournamentIntroByLanguage.es;
    const mode = getTournamentMode();

    if(mode !== "api"){

        container.innerHTML = manualHtml;
        return;

    }

    const apiUrl = getTournamentApiUrl();

    if(!apiUrl){

        container.innerHTML = manualHtml;
        return;

    }

    try{

        const apiHtml = await fetchTournamentIntroFromApi(lang, apiUrl);

        container.innerHTML = apiHtml || manualHtml;

    } catch(error){

        console.warn("No se pudo cargar Torneo desde API. Usando contenido manual.", error);

        container.innerHTML = manualHtml;

    }

}

function t(path){

    const keys = path.split(".");

    let value = translations[currentLanguage];

    for(const key of keys){

        value = value?.[key];

    }

    return value ?? "";

}

function setLanguage(lang){

    if(!translations[lang]) return;

    currentLanguage = lang;

    localStorage.setItem("language",lang);

    document.documentElement.lang = lang;

    document
        .querySelectorAll("[data-i18n]")
        .forEach(el=>{

            const text=t(el.dataset.i18n);

            if(text){

                el.textContent=text;

            }

        });

    renderTournamentIntro(lang);

    const toggle=document.getElementById("languageToggle");

    if(toggle){

        toggle.innerHTML = "🌐 <strong>" + languageNames[lang] + "</strong> ▼";

    }
    document
        .querySelectorAll("#languageMenu button")
        .forEach(button=>{

            button.classList.toggle(
                "active",
                button.dataset.lang===lang
            );

        });

}

function openLanguageMenu(){

    const menu=document.getElementById("languageMenu");
    if (!menu) return;

        menu.classList.toggle("show");

    

}

function closeLanguageMenu(){

    const menu=document.getElementById("languageMenu");

    if(menu){

        menu.classList.remove("show");

    }

}
document.addEventListener("DOMContentLoaded",()=>{

    setLanguage(currentLanguage);

    const toggle=document.getElementById("languageToggle");

    const menu=document.getElementById("languageMenu");

    if(toggle){

        toggle.addEventListener("click",(e)=>{

            e.stopPropagation();

            openLanguageMenu();

        });

    }

    document
        .querySelectorAll("#languageMenu button")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                setLanguage(button.dataset.lang);

                closeLanguageMenu();

            });

        });

    document.addEventListener("click",(e)=>{

        const selector=document.querySelector(".language-selector");

        if(selector && !selector.contains(e.target)){

            closeLanguageMenu();

        }

    });

});
