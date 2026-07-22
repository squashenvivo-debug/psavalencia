async function loadTravelCards(){

    const response = await fetch("data/travel.json");

    const data = await response.json();

    const container = document.getElementById("travelGrid");

    let html = "";

    data.cards.forEach(card=>{

        html += `

        <article class="travel-card">

            <img src="${card.image}" alt="${card.title}">

            <div class="travel-overlay">

                <span>${card.icon}</span>

                <h3>${card.title}</h3>

                <p>${card.description}</p>

                <button>${card.button}</button>

            </div>

        </article>

        `;

    });

    container.innerHTML = html;

}

document.addEventListener("DOMContentLoaded",loadTravelCards);