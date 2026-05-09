/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'.trim(); // Nettoyage automatique
const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';
const API_TEAMS_TOP100 = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

// Liste de proxies (si l'un tombe, l'autre prend le relais)
const PROXIES = 'https://proxy-cs2.vercel.app/'
];

let currentMatches = [];
let allTeams = []; 
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2', 'FaZe'];
let currentUser = JSON.parse(localStorage.getItem('cs2_user')) || null;

/**
 * 2. MOTEUR DE RÉCUPÉRATION ROBUSTE
 */
async function apiFetch(targetUrl) {
    let lastError = "";
    
    // On tente chaque proxy de la liste
    for (let proxy of PROXIES) {
        try {
            const fullUrl = proxy + encodeURIComponent(`${targetUrl}&token=${PANDA_TOKEN}`);
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                if (data) return data;
            }
            if (response.status === 401) return { error: "TOKEN INVALIDE (Vérifie ton mail de confirmation PandaScore)" };
        } catch (e) {
            lastError = "CONFLIT NAVIGATEUR : Le Proxy est bloqué.";
        }
    }
    return { error: lastError || "SERVEUR INDISPONIBLE : Réessaie dans 1 minute." };
}

/**
 * 3. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if(!container) return;

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + (page === 'settings' ? 'settings' : page));
    if (activeNav) activeNav.classList.add('active');
    
    container.innerHTML = "";
    closeDetail();
    
    if (page === 'matches') {
        if(subTabs) subTabs.style.display = 'flex';
        fetchLiveMatches();
    } else if (page === 'news') {
        if(subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } else if (page === 'settings') {
        if(subTabs) subTabs.style.display = 'none';
        renderProfilPage(container);
    }
}

/**
 * 4. LOGIQUE DES MATCHS
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron;">SCANNING NETWORK...</div>`;
    
    const data = await apiFetch(API_MATCHS);
    
    if (data.error) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#ff4444;">
                <div style="font-size:2rem; margin-bottom:10px;">⚠️</div>
                <div style="font-size:0.7rem; font-family:Orbitron;">${data.error}</div>
                <button onclick="location.reload()" style="margin-top:20px; background:var(--accent); border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">RECHARGER</button>
            </div>`;
    } else {
        currentMatches = data;
        filterMatches('TOUS', document.querySelector('.tab'));
    }
}

/**
 * 5. SYSTÈME ÉQUIPES
 */
async function renderTeamsView(container) {
    container.innerHTML = `<div id="teams-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
        <div style="grid-column: span 2; text-align:center; color:var(--accent); padding:40px;">SYNCING TOP 100...</div>
    </div>`;

    if (allTeams.length === 0) {
        const data = await apiFetch(API_TEAMS_TOP100);
        if (data.error) {
            document.getElementById('teams-grid').innerHTML = `<div style="grid-column:span 2; color:red; text-align:center; font-size:0.7rem;">${data.error}</div>`;
            return;
        }
        allTeams = Array.isArray(data) ? data.filter(t => t.name) : [];
    }
    applyTeamFilters();
}

function applyTeamFilters() {
    const grid = document.getElementById('teams-grid');
    if (!grid) return;
    grid.innerHTML = allTeams.map((team, index) => {
        const isFav = favorites.includes(team.name);
        return `
            <div class="match-card" style="padding:15px; text-align:center; position:relative;">
                <div style="position:absolute; top:5px; left:8px; font-size:0.5rem; color:gray;">#${index+1}</div>
                <img src="${team.image_url || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:contain; margin-bottom:8px;">
                <div style="font-size:0.65rem; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${team.name}</div>
                <button onclick="toggleFavorite('${team.name}')" style="margin-top:8px; width:100%; background:${isFav ? 'var(--accent)' : '#222'}; border:none; color:${isFav ? 'black' : 'white'}; font-size:0.5rem; padding:5px; border-radius:4px;">
                    ${isFav ? 'FAVORI' : 'SUIVRE'}
                </button>
            </div>`;
    }).join('');
}

/**
 * LE RESTE DES FONCTIONS (Stables)
 */
function filterMatches(type, element) {
    const container = document.getElementById('match-list');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    if (type === 'EQUIPES') { renderTeamsView(container); return; }
    container.innerHTML = currentMatches.filter(m => {
        if (type === 'LIVE') return m.status === 'running';
        if (type === 'FAVORIS') return favorites.includes(m.opponents[0]?.opponent?.name) || favorites.includes(m.opponents[1]?.opponent?.name);
        return true;
    }).map(m => `
        <div class="match-card" onclick="openMatchDetail(${m.id})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:30%; text-align:center;"><img src="${m.opponents[0]?.opponent.image_url}" width="30"></div>
                <div style="font-size:1.2rem; font-weight:900;">${m.results[0].score} - ${m.results[1].score}</div>
                <div style="width:30%; text-align:center;"><img src="${m.opponents[1]?.opponent.image_url}" width="30"></div>
            </div>
        </div>`).join('');
}

function toggleFavorite(n) {
    favorites.includes(n) ? favorites = favorites.filter(f=>f!==n) : favorites.push(n);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    applyTeamFilters();
}

function renderProfilPage(c) {
    if(!currentUser) {
        c.innerHTML = `<div style="padding:40px; text-align:center;"><input id="l-u" placeholder="Pseudo" style="width:100%; padding:15px; background:#111; color:white; border:1px solid #333; border-radius:10px;"><button onclick="hL()" style="width:100%; padding:15px; background:var(--accent); margin-top:10px; border-radius:10px; font-weight:bold;">LOGIN</button></div>`;
    } else {
        c.innerHTML = `<div style="padding:20px;"><h2>${currentUser.username}</h2><button onclick="hLo()" style="color:red; background:none; border:1px solid red; padding:10px; border-radius:10px;">LOGOUT</button></div>`;
    }
}
function hL() { const v = document.getElementById('l-u').value; if(v) { currentUser={username:v}; localStorage.setItem('cs2_user', JSON.stringify(currentUser)); navigateTo('settings'); }}
function hLo() { currentUser=null; localStorage.removeItem('cs2_user'); navigateTo('settings'); }
function renderNews(c) { c.innerHTML = `<div class="news-card" onclick="window.open('https://www.hltv.org/news', '_blank')" style="padding:15px; background:var(--card); border-radius:15px;"><h3>ACTU HLTV</h3><p>Cliquez pour voir les news.</p></div>`; }
function openMatchDetail(id) { document.getElementById('match-detail').style.display='block'; document.getElementById('match-detail').innerHTML=`<div style="padding:20px; background:var(--bg); height:100vh;"><button onclick="closeDetail()">RETOUR</button></div>`; }
function closeDetail() { document.getElementById('match-detail').style.display='none'; }

window.onload = () => navigateTo('matches');
