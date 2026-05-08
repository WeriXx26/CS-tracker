/**
 * 1. DONNÉES DE SIMULATION
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 },
    { id: 3, team1: "MOUZ", logo1: "https://i.ibb.co/9vK7hM0/wildcard.png", team2: "Furia", logo2: "https://i.ibb.co/P4zH5Vj/nouns.png", league: "ESL PRO LEAGUE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 7200000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';
let isDetailOpen = false; // Sécurité pour empêcher la fermeture auto

/**
 * 2. NAVIGATION ET FILTRES
 */
function navigateTo(page) {
    if (isDetailOpen) closeDetail(); // Ferme proprement le détail si on change de page
    
    currentPage = page;
    const container = document.getElementById('match-list');
    const tabs = document.querySelector('.tabs');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');

    if (page === 'matches') {
        tabs.style.display = 'flex';
        const activeTab = document.querySelector('.tab.active') || document.querySelector('.tab');
        filterMatches(activeTab.innerText, activeTab);
    } 
    else if (page === 'news') {
        tabs.style.display = 'none';
        renderNews(container);
    } 
    else if (page === 'settings') {
        tabs.style.display = 'none';
        renderSettings(container);
    }
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    const container = document.getElementById('match-list');
    
    // Skeleton effect
    container.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div>`;

    setTimeout(() => {
        let filtered = matches;
        if (type === 'EN DIRECT' || type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
        if (type === 'FAVORIS' || type === 'FAV') filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));
        renderList(filtered);
    }, 400);
}

/**
 * 3. AFFICHAGE DES LISTES
 */
function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; margin-top:50px; color:var(--gray);">Aucun match disponible</div>`;
        return;
    }

    list.forEach(m => {
        const isFav1 = favorites.includes(m.team1) ? '⭐' : '☆';
        const isFav2 = favorites.includes(m.team2) ? '⭐' : '☆';
        const timeDisplay = m.status === 'LIVE' ? '● LIVE' : getCountdown(m.startTime);

        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="team" onclick="toggleFavorite('${m.team1}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo1}" style="width:40px; height:40px; object-fit:contain;">
                        <div style="font-size:0.7rem; margin-top:8px;">${isFav1} ${m.team1}</div>
                    </div>
                    
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.3rem; font-weight:800; color:var(--accent);">${m.score}</div>
                        <div style="font-size:0.6rem; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:6px; margin-top:8px; color:${m.status === 'LIVE' ? 'var(--live)' : 'white'};">
                            ${timeDisplay}
                        </div>
                    </div>

                    <div class="team" onclick="toggleFavorite('${m.team2}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo2}" style="width:40px; height:40px; object-fit:contain;">
                        <div style="font-size:0.7rem; margin-top:8px;">${m.team2} ${isFav2}</div>
                    </div>
                </div>
            </div>`;
    });
}

/**
 * 4. VUE DÉTAILLÉE (CORRIGÉE)
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    isDetailOpen = true; // On bloque le refresh auto
    
    const stats = { adr: 82, kast: 75, entry: 60 };

    view.innerHTML = `
        <div style="padding:20px; height:100%; display:flex; flex-direction:column; background: #0b0d10; overflow-y:auto;">
            <button onclick="closeDetail()" style="background:none; border:none; color:var(--accent); font-weight:800; padding:15px 0; font-family:Orbitron; cursor:pointer; width:fit-content;">← BACK</button>
            
            <div class="match-card" style="text-align:center; padding:30px 10px; margin-top:10px;">
                <p style="color:var(--accent); font-size:0.6rem; letter-spacing:2px; margin-bottom:15px;">${m.league}</p>
                <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                    <div><img src="${m.logo1}" width="50"><h4>${m.team1}</h4></div>
                    <div style="font-size:1.5rem; font-weight:900; color:var(--accent);">${m.score}</div>
                    <div><img src="${m.logo2}" width="50"><h4>${m.team2}</h4></div>
                </div>
            </div>

            <div style="margin-top:25px;">
                <h3 style="font-family:Orbitron; font-size:0.7rem; color:var(--accent); margin-bottom:15px;">TEAM STATS</h3>
                ${renderStatBar("ADR Moyen", stats.adr)}
                ${renderStatBar("KAST %", stats.kast)}
                ${renderStatBar("Entry Success", stats.entry)}
            </div>

            <button style="background:#9146ff; color:white; border:none; padding:16px; border-radius:12px; width:100%; margin-top:auto; font-weight:800; font-family:Orbitron;">WATCH LIVE</button>
        </div>`;
    
    view.style.display = 'block';
}

function renderStatBar(label, value) {
    return `
        <div style="margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; font-size:0.6rem; color:var(--gray); margin-bottom:5px;"><span>${label}</span><span>${value}</span></div>
            <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px;">
                <div style="background:var(--accent); width:${value}%; height:100%; border-radius:2px;"></div>
            </div>
        </div>`;
}

function closeDetail() {
    document.getElementById('match-detail').style.display = 'none';
    isDetailOpen = false; // On autorise à nouveau le refresh
}

/**
 * 5. LOGIQUE FAVORIS ET UTILS
 */
function toggleFavorite(team, e) {
    e.stopPropagation(); // Empêche d'ouvrir le match en cliquant sur l'étoile
    favorites.includes(team) ? favorites = favorites.filter(f => f !== team) : favorites.push(team);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    
    // Rafraîchir la vue actuelle
    if (currentPage === 'matches') {
        const activeTab = document.querySelector('.tab.active');
        renderList(matches); // On rend la liste sans le skeleton pour la fluidité
    }
}

function getCountdown(startTime) {
    const diff = startTime - new Date().getTime();
    if (diff <= 0) return "EN DIRECT";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `Dans ${h}h ${m}m` : `Dans ${m} min`;
}

function clearData() {
    if(confirm("Réinitialiser l'application ?")) {
        localStorage.clear();
        location.reload();
    }
}

/**
 * 6. NEWS & SETTINGS RENDERERS
 */
function renderNews(container) {
    container.innerHTML = `
        <div style="animation: fadeIn 0.4s;">
            <h2 style="font-family:Orbitron; font-size:0.9rem; color:var(--accent); margin-bottom:20px;">NEWS FEED</h2>
            <div class="news-card" style="background:var(--card); border-radius:12px; overflow:hidden; margin-bottom:15px;">
                <img src="https://news.esea.net/content/images/2023/09/CS2_1.jpg" style="width:100%; height:120px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3 style="font-size:0.8rem; margin:0;">Dust II est de retour !</h3>
                </div>
            </div>
        </div>`;
}

function renderSettings(container) {
    container.innerHTML = `
        <div style="padding:20px; text-align:center; animation: fadeIn 0.4s;">
            <h2 style="font-family:Orbitron; color:var(--accent);">SETTINGS</h2>
            <button onclick="clearData()" style="background:rgba(255,0,0,0.1); color:red; border:1px solid red; padding:15px; border-radius:12px; width:100%; margin-top:20px; cursor:pointer;">RESET DATA</button>
        </div>`;
}

// Lancement
window.onload = () => navigateTo('matches');

// Refresh auto toutes les 60s SEULEMENT si on n'est pas dans un détail de match
setInterval(() => {
    if(currentPage === 'matches' && !isDetailOpen) {
        const activeTab = document.querySelector('.tab.active');
        filterMatches(activeTab.innerText, activeTab);
    }
}, 60000);
