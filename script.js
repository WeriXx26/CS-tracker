/**
 * 1. CONFIGURATION & ÉTAT
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; // <-- METS TON TOKEN ICI
const PROXY = 'https://corsproxy.io/?'; 
const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=25';
const API_TEAMS = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2', 'FaZe'];
let currentView = 'matches';

/**
 * 2. MOTEUR DE RÉCUPÉRATION
 */
async function fetchData(url) {
    try {
        const fullUrl = PROXY + encodeURIComponent(url + '&token=' + PANDA_TOKEN);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Erreur réseau");
        return await response.json();
    } catch (e) {
        console.error("Erreur API:", e);
        return null;
    }
}

/**
 * 3. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    currentView = page;
    
    // Reset
    container.innerHTML = "";
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-' + (page === 'settings' ? 'settings' : page))?.classList.add('active');

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        fetchAndRenderMatches();
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        container.innerHTML = `
            <div class="news-card" onclick="window.open('https://www.hltv.org/news', '_blank')" style="margin-top:20px; padding:20px; background:#111; border-radius:15px; border-left:4px solid #ffb400; cursor:pointer;">
                <h3 style="font-family:Orbitron; font-size:0.8rem;">ACTUALITÉ HLTV</h3>
                <p style="font-size:0.6rem; color:gray; margin-top:5px;">Cliquez pour ouvrir les dernières news pro.</p>
            </div>`;
    }
}

/**
 * 4. GESTION DES MATCHS
 */
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron; font-size:0.6rem;">SYNCING MATCHES...</div>`;
    
    const data = await fetchData(API_MATCHS);
    if (data && Array.isArray(data)) {
        currentMatches = data;
        renderMatchList(currentMatches);
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Erreur API PandaScore</div>`;
    }
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match disponible.</div>`;
        return;
    }
    
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const score1 = m.results[0]?.score ?? 0;
        const score2 = m.results[1]?.score ?? 0;
        const isLive = m.status === 'running';

        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')" style="border-left: 3px solid ${isLive ? 'red' : 'transparent'}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;">
                        <img src="${t1.image_url}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem; margin-top:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t1.name}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.1rem; font-weight:900; color:${isLive ? 'red' : 'white'}">${score1} - ${score2}</div>
                        <div style="font-size:0.4rem; color:gray; text-transform:uppercase;">${m.status}</div>
                    </div>
                    <div style="width:30%; text-align:center;">
                        <img src="${t2.image_url}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem; margin-top:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

/**
 * 5. GESTION DES ÉQUIPES (TOP 100)
 */
async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron; font-size:0.6rem;">SYNCING TOP 100...</div>`;

    if (allTeams.length === 0) {
        const data = await fetchData(API_TEAMS);
        if (data && Array.isArray(data)) {
            allTeams = data.filter(t => t.name && t.image_url);
        }
    }

    if (allTeams.length > 0) {
        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:5px;">
                ${allTeams.map((team, index) => {
                    const isFav = favorites.includes(team.name);
                    return `
                    <div class="match-card" style="text-align:center; padding:15px; position:relative;">
                        <span style="position:absolute; top:5px; left:8px; font-size:0.45rem; color:gray;">#${index+1}</span>
                        <img src="${team.image_url}" style="width:40px; height:40px; object-fit:contain; margin-bottom:10px;">
                        <div style="font-size:0.65rem; font-weight:bold; white-space:nowrap; overflow:hidden;">${team.name}</div>
                        <button onclick="toggleFavorite('${team.name}')" 
                                style="margin-top:10px; width:100%; border:none; background:${isFav ? '#ffb400' : '#222'}; color:${isFav ? 'black' : 'white'}; padding:5px; border-radius:5px; font-size:0.5rem; font-weight:bold;">
                            ${isFav ? 'SUIVI' : 'SUIVRE'}
                        </button>
                    </div>`;
                }).join('')}
            </div>`;
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Erreur de chargement des équipes.</div>`;
    }
}

/**
 * 6. FILTRES & FAVORIS
 */
function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    if (type === 'EQUIPES') {
        fetchAndRenderTeams();
    } else if (type === 'FAVORIS') {
        const favMatches = currentMatches.filter(m => 
            favorites.includes(m.opponents[0]?.opponent.name) || 
            favorites.includes(m.opponents[1]?.opponent.name)
        );
        renderMatchList(favMatches);
    } else if (type === 'LIVE') {
        const liveMatches = currentMatches.filter(m => m.status === 'running');
        renderMatchList(liveMatches);
    } else {
        renderMatchList(currentMatches);
    }
}

function toggleFavorite(name) {
    event.stopPropagation();
    if (favorites.includes(name)) {
        favorites = favorites.filter(f => f !== name);
    } else {
        favorites.push(name);
    }
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    fetchAndRenderTeams();
}

/**
 * 7. MODALES DÉTAILS
 */
function openMatchDetail(id) {
    const match = currentMatches.find(m => m.id == id);
    const detail = document.getElementById('match-detail');
    if(!match) return;

    detail.style.display = 'block';
    detail.innerHTML = `
        <div style="padding:20px; background:#000; height:100vh; text-align:center;">
            <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400; border:none; padding:10px 20px; border-radius:10px; font-weight:bold; font-family:Orbitron;">RETOUR</button>
            <h3 style="margin-top:40px; color:#ffb400; font-family:Orbitron;">${match.league.name}</h3>
            <div style="margin-top:30px; font-size:1.5rem; font-weight:bold;">
                ${match.opponents[0].opponent.name} <span style="color:#ffb400;">VS</span> ${match.opponents[1].opponent.name}
            </div>
            <div style="margin-top:50px; padding:20px; background:#111; border-radius:15px;">
                <p style="font-size:0.7rem; color:gray;">Format: ${match.number_of_games > 1 ? 'BO' + match.number_of_games : 'BO1'}</p>
                <p style="font-size:0.7rem; color:gray; margin-top:10px;">ID Match: ${id}</p>
            </div>
            <button onclick="window.open('https://www.hltv.org/search?query=${match.opponents[0].opponent.name}', '_blank')" style="margin-top:30px; width:100%; padding:15px; background:white; color:black; border:none; border-radius:10px; font-weight:bold;">CONSULTER SUR HLTV</button>
        </div>`;
}

// Init
window.onload = () => navigateTo('matches');
