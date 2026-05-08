/**
 * DONNÉES
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 },
    { id: 3, team1: "MOUZ", logo1: "https://i.ibb.co/9vK7hM0/wildcard.png", team2: "Furia", logo2: "https://i.ibb.co/P4zH5Vj/nouns.png", league: "ESL PRO LEAGUE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 7200000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';

/**
 * NAVIGATION
 */
function navigateTo(page) {
    // Si on change de page via le footer, on force la fermeture du détail
    document.getElementById('match-detail').style.display = 'none';
    
    currentPage = page;
    const container = document.getElementById('match-list');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');

    if (page === 'matches') {
        document.querySelector('.tabs').style.display = 'flex';
        const activeTab = document.querySelector('.tab.active') || document.querySelector('.tab');
        filterMatches(activeTab.innerText, activeTab);
    } else {
        document.querySelector('.tabs').style.display = 'none';
        container.innerHTML = `<div style="padding:40px; text-align:center; color:gray;">Onglet ${page} en cours...</div>`;
    }
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    renderList(matches, type);
}

/**
 * LOGIQUE D'AFFICHAGE
 */
function renderList(list, type) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    let filtered = list;
    if (type === 'LIVE') filtered = list.filter(m => m.status === 'LIVE');
    if (type === 'FAV') filtered = list.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));

    filtered.forEach(m => {
        const isFav1 = favorites.includes(m.team1) ? '⭐' : '☆';
        const isFav2 = favorites.includes(m.team2) ? '⭐' : '☆';
        
        // Création de l'élément manuellement pour plus de sécurité sur les clics
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
                <div style="width:30%; text-align:center;">
                    <img src="${m.logo1}" width="35">
                    <div style="font-size:0.7rem; margin-top:5px;">${isFav1} ${m.team1}</div>
                </div>
                <div style="text-align:center; flex:1;">
                    <div style="font-size:1.2rem; font-weight:800; color:var(--accent);">${m.score}</div>
                    <div style="font-size:0.6rem; opacity:0.7; margin-top:5px;">${m.status}</div>
                </div>
                <div style="width:30%; text-align:center;">
                    <img src="${m.logo2}" width="35">
                    <div style="font-size:0.7rem; margin-top:5px;">${m.team2} ${isFav2}</div>
                </div>
            </div>
        `;
        // On attache l'événement au clic sur la carte uniquement
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMatchDetail(m.id);
        });
        container.appendChild(card);
    });
}

/**
 * VUE DÉTAIL (SÉCURISÉE)
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    
    view.innerHTML = `
        <div class="detail-content" style="padding:20px; background:#0b0d10; height:100vh;">
            <button id="btn-back" style="background:var(--accent); color:black; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; margin-bottom:20px;">← RETOUR</button>
            <div class="match-card" style="text-align:center; padding:30px 10px;">
                <h2 style="color:var(--accent); font-family:Orbitron;">${m.team1} vs ${m.team2}</h2>
                <div style="margin-top:30px;">
                    <div style="color:gray; font-size:0.8rem; margin-bottom:10px;">STATISTIQUES ADR</div>
                    <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                        <div style="background:var(--accent); width:75%; height:100%;"></div>
                    </div>
                </div>
                <button style="width:100%; margin-top:40px; padding:15px; background:#9146ff; border:none; color:white; border-radius:12px; font-weight:bold;">REGARDER LE LIVE</button>
            </div>
        </div>
    `;

    view.style.display = 'block';

    // Sécurité : on attache l'événement de fermeture APRES l'affichage
    document.getElementById('btn-back').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        view.style.display = 'none';
    };
}

// Initialisation au chargement
window.onload = () => navigateTo('matches');
