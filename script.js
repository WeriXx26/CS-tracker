/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; 
const PROXY = 'https://corsproxy.io/?'; 
// On demande tous les matchs CS (CSGO + CS2) triés par statut (LIVE en premier) puis par date
const API_BASE = 'https://api.pandascore.co/cs/matches?sort=status,-begin_at';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];

/**
 * 2. NAVIGATION (Correction surbrillance & News)
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const searchWrapper = document.getElementById('search-wrapper');
    const subTabs = document.getElementById('sub-tabs');
    
    // Correction de la surbrillance des onglets
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');

    container.innerHTML = "";
    if (page === 'matches') {
        searchWrapper.style.display = 'block';
        subTabs.style.display = 'flex';
        fetchAndRenderMatches(true);
    } else {
        searchWrapper.style.display = 'none';
        subTabs.style.display = 'none';
        container.innerHTML = `
            <div class="match-card" onclick="window.open('https://www.hltv.org', '_blank')" style="margin-top:20px; text-align:center; padding:30px;">
                <h3 style="font-family:Orbitron; color:#ffb400;">HLTV NEWS</h3>
                <p style="font-size:0.7rem; color:gray; margin-top:10px;">Consulter les dernières actualités mondiales.</p>
            </div>`;
    }
}

/**
 * 3. LOGIQUE MATCHS & PGL ASTANA
 */
async function fetchAndRenderMatches(isNew = true) {
    const container = document.getElementById('match-list');
    if(isNew) container.innerHTML = `<div class="loader">SYNCING...</div>`;

    const url = `${API_BASE}&per_page=50&token=${PANDA_TOKEN}`; // On passe à 50 pour être sûr de capter PGL
    try {
        const response = await fetch(PROXY + encodeURIComponent(url));
        const data = await response.json();
        if (data && Array.isArray(data)) {
            currentMatches = data;
            renderMatchList(currentMatches);
        }
    } catch (e) {
        container.innerHTML = `<div style="color:red; text-align:center;">Erreur API</div>`;
    }
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match trouvé.</div>`;
        return;
    }

    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const isLive = m.status === 'running';
        const date = new Date(m.begin_at);
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')" style="border-left: 3px solid ${isLive ? '#ff4444' : '#333'}">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.5rem; font-family:Orbitron; color:gray;">
                    <span>${isLive ? '<b class="live-badge">● LIVE</b>' : time}</span>
                    <span style="text-transform:uppercase;">${m.league.name}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:35%; text-align:center;">
                        <img src="${t1.image_url}" width="25" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.6rem; margin-top:5px;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.1rem; font-weight:900;">${m.results[0]?.score} - ${m.results[1]?.score}</div>
                    <div style="width:35%; text-align:center;">
                        <img src="${t2.image_url}" width="25" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.6rem; margin-top:5px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

/**
 * 4. ÉQUIPES & FAVORIS (Correction Affichage)
 */
async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING TEAMS...</div>`;

    if (allTeams.length === 0) {
        const url = `https://api.pandascore.co/cs/teams?sort=-videogame_score&per_page=50&token=${PANDA_TOKEN}`;
        const response = await fetch(PROXY + encodeURIComponent(url));
        allTeams = await response.json();
    }

    renderTeamGrid(allTeams);
}

function renderTeamGrid(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="teams-grid">
        ${list.map((team, index) => {
            const isFav = favorites.includes(team.name);
            return `
                <div class="match-card" style="text-align:center; padding:10px;">
                    <img src="${team.image_url}" style="width:35px; height:35px; object-fit:contain; margin-bottom:5px;">
                    <div style="font-size:0.6rem; font-weight:bold; overflow:hidden;">${team.name}</div>
                    <button onclick="toggleFav('${team.name}')" style="margin-top:8px; border:none; border-radius:5px; width:100%; padding:5px; font-size:0.5rem; font-weight:bold; background:${isFav ? '#ffb400' : '#222'}; color:${isFav ? '#000' : '#fff'};">
                        ${isFav ? 'SUIVI' : 'SUIVRE'}
                    </button>
                </div>`;
        }).join('')}
    </div>`;
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    if(type === 'EQUIPES') fetchAndRenderTeams();
    else if(type === 'FAVORIS') {
        const favMatches = currentMatches.filter(m => 
            favorites.includes(m.opponents[0]?.opponent.name) || 
            favorites.includes(m.opponents[1]?.opponent.name)
        );
        renderMatchList(favMatches);
    } else {
        fetchAndRenderMatches(true);
    }
}

function toggleFav(name) {
    event.stopPropagation(); // Empêche d'ouvrir les détails en cliquant sur le bouton
    favorites.includes(name) ? favorites = favorites.filter(f => f !== name) : favorites.push(name);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    renderTeamGrid(allTeams);
}

/**
 * 5. DÉTAILS DU MATCH (Correction affichage complet)
 */
function openMatchDetail(id) {
    const match = currentMatches.find(m => m.id == id);
    const detail = document.getElementById('match-detail');
    if(!match) return;

    detail.style.display = 'block';
    detail.innerHTML = `
        <div style="padding:20px; background:#000; height:100vh; text-align:center;">
            <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400; border:none; padding:10px 20px; border-radius:10px; font-weight:bold; font-family:Orbitron; cursor:pointer;">RETOUR</button>
            
            <h3 style="margin-top:30px; color:#ffb400; font-family:Orbitron; font-size:0.8rem;">${match.league.name}</h3>
            <p style="color:gray; font-size:0.6rem;">${match.serie.full_name}</p>

            <div style="display:flex; justify-content:space-around; align-items:center; margin-top:40px;">
                <div>
                    <img src="${match.opponents[0].opponent.image_url}" width="60">
                    <div style="font-weight:bold; margin-top:10px;">${match.opponents[0].opponent.name}</div>
                </div>
                <div style="font-size:2rem; font-weight:900;">${match.results[0].score} : ${match.results[1].score}</div>
                <div>
                    <img src="${match.opponents[1].opponent.image_url}" width="60">
                    <div style="font-weight:bold; margin-top:10px;">${match.opponents[1].opponent.name}</div>
                </div>
            </div>

            <div style="margin-top:40px; background:#111; padding:20px; border-radius:15px; text-align:left;">
                <p style="font-size:0.7rem;"><b>Format:</b> BO${match.number_of_games}</p>
                <p style="font-size:0.7rem; margin-top:5px;"><b>Status:</b> ${match.status.toUpperCase()}</p>
                <p style="font-size:0.7rem; margin-top:5px;"><b>Date:</b> ${new Date(match.begin_at).toLocaleString()}</p>
            </div>
        </div>`;
}

// Lancement
window.onload = () => navigateTo('matches');
