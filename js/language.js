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

const languageNames = {

    es: "ES",

    va: "VA",

    en: "EN",

    fr: "FR"

};

let currentLanguage =
localStorage.getItem("language") || "es";

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