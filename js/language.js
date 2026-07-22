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
            title: "PSA VALENCIA OPEN 2026",
            subtitle: "Memorial Chimo Marmaneu",
            live: "VER DIRECTO",
            draw: "CUADROS"
        }

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
            title: "PSA VALÈNCIA OPEN 2026",
            subtitle: "Memorial Chimo Marmaneu",
            live: "VEURE DIRECTE",
            draw: "QUADRES"
        }

    },

    en: {

        menu: {
            home: "Home",
            tournament: "Tournament",
            players: "Players",
            schedule: "Schedule",
            draw: "Draw",
            live: "Live",
            news: "News",
            gallery: "Gallery",
            venue: "Venue"
        },

        hero: {
            title: "PSA VALENCIA OPEN 2026",
            subtitle: "Chimo Marmaneu Memorial",
            live: "WATCH LIVE",
            draw: "DRAWS"
        }

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
            title: "PSA VALENCIA OPEN 2026",
            subtitle: "Mémorial Chimo Marmaneu",
            live: "DIRECT",
            draw: "TABLEAUX"
        }

    }

};

let currentLanguage = localStorage.getItem("language") || "es";

function t(path){

    const keys = path.split(".");

    let value = translations[currentLanguage];

    keys.forEach(key => {

        value = value?.[key];

    });

    return value || path;

}

function setLanguage(lang){

    currentLanguage = lang;

    localStorage.setItem("language", lang);

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(element => {

        element.textContent = t(element.dataset.i18n);

    });

    document.querySelectorAll(".language-selector button").forEach(button => {

        button.classList.toggle("active", button.dataset.lang === lang);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    setLanguage(currentLanguage);

    document.querySelectorAll(".language-selector button").forEach(button => {

        button.addEventListener("click", () => {

            setLanguage(button.dataset.lang);

        });

    });

});