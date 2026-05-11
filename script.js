/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; 
const PROXY = 'https://corsproxy.io/?'; 
const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=begin_at&per_page=25'; // Trié par date
const API_TEAMS = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];

/**
 * 2. UTILITAIRE : FORMATAGE DE L'HEURE
 */
function formatMatchTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

async function fetchData(url) {
    try {
        const fullUrl = PROXY + encodeURIComponent(url + '&token=' + PANDA_TOKEN);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Erreur");
        return await response.json();
    } catch (e) {
        return null;
    }
}

/**
 * 3. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    container.innerHTML = "";

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        // On s'assure que l'onglet "TOUS" est actif par défaut
        filterMatches('TOUS', document.querySelector('.tab'));
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        container.innerHTML = `<div class="news-card" onclick="window.open('https://www.hltv.org', '_blank')"><h3>ACTUALITÉ HLTV</h3><p>Cliquez pour voir les derniers résultats.</p></div>`;
    }
}

/**
 * 4. LOGIQUE DES MATCHS (Heure + Live)
 */
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron; font-size:0.6rem;">CHARGEMENT DES MATCHS...</div>`;
    
    const data = await fetchData(API_MATCHS);
    if (data) {
        currentMatches = data;
        renderMatchList(currentMatches);
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
        const startTime = formatMatchTime(m.begin_at);

        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')" style="position:relative; border-left: 3px solid ${isLive ? '#ff4444' : '#333'}">
                <div style="position:absolute; top:8px; left:50%; transform:translateX(-50%); font-size:0.5rem; font-family:Orbitron; font-weight:bold;">
                    ${isLive ? '<span style="color:#ff4444; animation: blink 1s infinite;">● EN DIRECT</span>' : '<span style="color:gray;">DÉBUT À ' + startTime + '</span>'}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <div style="width:30%; text-align:center;">
                        <img src="${t1.image_url}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem; margin-top:5px; white-space:nowrap; overflow:hidden;">${t1.name}</div>
                    </div>
                    
                    <div style="text-align:center;">
                        <div style="font-size:1.1rem; font-weight:900;">${m.results[0]?.score ?? 0} - ${m.results[1]?.score ?? 0}</div>
                        <div style="font-size:0.4rem; color:gray;">${m.league.name}</div>
                    </div>

                    <div style="width:30%; text-align:center;">
                        <img src="${t2.image_url}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem; margin-top:5px; white-space:nowrap; overflow:hidden;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

/**
 * 5. LOGIQUE ÉQUIPES (TOP 100)
 */
async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron; font-size:0.6rem;">SYNCING TEAMS...</div>`;

    if (allTeams.length === 0) {
        const data = await fetchData(API_TEAMS);
        if (data && Array.isArray(data)) {
            allTeams = data.filter(t => t.name);
        }
    }

    if (allTeams.length > 0) {
        container.innerHTML = `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:5px;">
            ${allTeams.map((team, index) => {
                const isFav = favorites.includes(team.name);
                return `
                <div class="match-card" style="text-align:center; padding:15px; position:relative;">
                    <span style="position:absolute; top:5px; left:8px; font-size:0.45rem; color:gray;">#${index+1}</span>
                    <img src="${team.image_url || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:contain; margin-bottom:10px;">
                    <div style="font-size:0.65rem; font-weight:bold; white-space:nowrap; overflow:hidden;">${team.name}</div>
                    <button onclick="toggleFavorite('${team.name}')" 
                            style="margin-top:10px; width:100%; border:none; background:${isFav ? '#ffb400' : '#222'}; color:${isFav ? 'black' : 'white'}; padding:5px; border-radius:5px; font-size:0.5rem; font-weight:bold;">
                        ${isFav ? 'SUIVI' : 'SUIVRE'}
                    </button>
                </div>`;
            }).join('')}
        </div>`;
    }
}

/**
 * 6. FILTRES
 */
function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if(element) element.classList.add('active');

    if (type === 'EQUIPES') {
        fetchAndRenderTeams();
    } else if (type === 'FAVORIS') {
        const favs = currentMatches.filter(m => favorites.includes(m.opponents[0]?.opponent.name) || favorites.includes(m.opponents[1]?.opponent.name));
        renderMatchList(favs);
    } else {
        fetchAndRenderMatches();
    }
}

function toggleFavorite(name) {
    favorites.includes(name) ? favorites = favorites.filter(f => f !== name) : favorites.push(name);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    fetchAndRenderTeams();
}

function openMatchDetail(id) {
    document.getElementById('match-detail').style.display = 'block';
    document.getElementById('match-detail').innerHTML = `<div style="padding:20px; background:#000; height:100vh; text-align:center;">
        <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400; border:none; padding:10px 20px; border-radius:10px; font-weight:bold;">RETOUR</button>
        <h2 style="margin-top:50px; font-family:Orbitron; color:#ffb400;">MATCH ${id}</h2>
    </div>`;
}

window.onload = () => navigateTo('matches');
