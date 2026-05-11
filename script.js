const API_URL = 'https://server-production-9224.up.railway.app'; 
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];
let allTeams = [];
let allPlayers = [];
let currentTab = 'matches'; 

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
}

// Recherche intelligente selon l'onglet
function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    const container = document.getElementById('match-list');

    if (currentTab === 'matches') {
        const filtered = currentMatches.filter(m => 
            m.opponents[0]?.opponent.name.toLowerCase().includes(q) || 
            m.opponents[1]?.opponent.name.toLowerCase().includes(q) ||
            m.league.name.toLowerCase().includes(q)
        );
        renderMatchList(filtered);
    } else if (currentTab === 'teams') {
        const filtered = allTeams.filter(t => t.name.toLowerCase().includes(q));
        renderTeamGrid(filtered);
    } else if (currentTab === 'players') {
        const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(q));
        renderPlayerGrid(filtered);
    }
}

function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');
    
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    const searchBar = document.getElementById('global-search');

    // Reset du placeholder de recherche
    searchBar.placeholder = "RECHERCHE...";

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        document.getElementById('search-wrapper').style.display = 'block';
        filterMatches('TOUS', document.querySelector('.tab')); 
    } else {
        // Mode ACTUS
        currentTab = 'news';
        subTabs.style.display = 'none';
        document.getElementById('search-wrapper').style.display = 'none';
        container.innerHTML = `
            <div class="match-card" onclick="window.open('https://www.hltv.org','_blank')" style="text-align:center;padding:60px 20px;">
                <h2 style="font-family:Orbitron; color:#ffb400;">HLTV NEWS</h2>
                <p style="color:gray; margin-top:10px;">Cliquez pour voir les derniers résultats et news sur HLTV.org</p>
            </div>`;
    }
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Aucun match en direct sur HLTV.</div>`;
        return;
    }
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0].opponent;
        const t2 = m.opponents[1].opponent;
        const isLive = m.status === 'running';
        
        // Correction des URLs HLTV si elles sont incomplètes
        const fixImg = (url) => {
            if (!url) return DEFAULT_LOGO;
            if (url.startsWith('/')) return 'https://www.hltv.org' + url;
            return url;
        };

        return `
            <div class="match-card">
                <div style="display:flex;justify-content:space-between;font-size:0.5rem;color:gray;margin-bottom:8px;">
                    <span>${isLive ? '<b style="color:#ff4444;animation:blink 1s infinite;">● LIVE</b>' : m.begin_at}</span>
                    <span>${m.league.name}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:35%;text-align:center;">
                        <img src="${fixImg(t1.image_url)}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.65rem;font-weight:bold;margin-top:4px;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.3rem;font-weight:900;color:${isLive ? '#ffb400' : '#fff'};">
                        ${m.results[0].score} - ${m.results[1].score}
                    </div>
                    <div style="width:35%;text-align:center;">
                        <img src="${fixImg(t2.image_url)}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.65rem;font-weight:bold;margin-top:4px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING MATCHES...</div>`;
    currentMatches = await fetchData('matches');
    renderMatchList(currentMatches);
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Aucun match trouvé.</div>`;
        return;
    }
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: DEFAULT_LOGO };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: DEFAULT_LOGO };
        const logo1 = t1.image_url || DEFAULT_LOGO;
        const logo2 = t2.image_url || DEFAULT_LOGO;
        
        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:30%;text-align:center;">
                        <img src="${logo1}" width="30" height="30" style="object-fit:contain;" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.6rem; margin-top:5px;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.2rem;font-weight:900;">${m.results[0]?.score ?? 0} - ${m.results[1]?.score ?? 0}</div>
                    <div style="width:30%;text-align:center;">
                        <img src="${logo2}" width="30" height="30" style="object-fit:contain;" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.6rem; margin-top:5px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING TEAMS...</div>`;
    if (allTeams.length === 0) allTeams = await fetchData('teams');
    renderTeamGrid(allTeams);
}

function renderTeamGrid(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="teams-grid">` + list.map(t => `
        <div class="match-card" style="text-align:center;">
            <img src="${t.image_url || DEFAULT_LOGO}" style="width:40px;height:40px;object-fit:contain;" onerror="this.src='${DEFAULT_LOGO}'">
            <div style="font-size:0.7rem;font-weight:bold;margin-top:5px;">${t.name}</div>
        </div>`).join('') + `</div>`;
}

async function fetchAndRenderPlayers() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING PLAYERS...</div>`;
    if (allPlayers.length === 0) allPlayers = await fetchData('players');
    renderPlayerGrid(allPlayers);
}

function renderPlayerGrid(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="teams-grid">` + list.map(p => `
        <div class="match-card" style="text-align:center;" onclick="openPlayerDetail('${p.id}')">
            <img src="${p.image_url || DEFAULT_LOGO}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.src='${DEFAULT_LOGO}'">
            <div style="font-size:0.7rem;margin-top:5px;">${p.name}</div>
        </div>`).join('') + `</div>`;
}

// Fonctions de détails (Modales)
function openMatchDetail(id) {
    const m = currentMatches.find(x => x.id == id);
    if(!m) return;
    const d = document.getElementById('match-detail');
    d.style.display = 'block';
    d.innerHTML = `<div style="padding:20px;text-align:center;background:#000;height:100vh;"><button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400;border:none;padding:10px 20px;border-radius:10px;font-family:Orbitron;">RETOUR</button><h3 style="margin-top:30px;color:#ffb400;">${m.league.name}</h3></div>`;
}

function openPlayerDetail(id) {
    const p = allPlayers.find(x => x.id == id);
    if(!p) return;
    const d = document.getElementById('match-detail');
    d.style.display = 'block';
    d.innerHTML = `<div style="padding:20px;text-align:center;background:#000;height:100vh;"><button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400;border:none;padding:10px 20px;border-radius:10px;font-family:Orbitron;">RETOUR</button><h2>${p.name}</h2></div>`;
}

window.onload = () => navigateTo('matches');
