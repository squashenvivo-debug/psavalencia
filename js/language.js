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
