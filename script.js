const API_URL = 'https://server-production-9224.up.railway.app'; 
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];
let allTeams = [];
let allPlayers = [];
let currentTab = 'matches'; // Suivi de l'onglet actif pour la recherche

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
}

// Gestionnaire de recherche intelligente
function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    
    if (currentTab === 'matches') {
        const filtered = currentMatches.filter(m => 
            m.opponents[0]?.opponent.name.toLowerCase().includes(q) || 
            m.opponents[1]?.opponent.name.toLowerCase().includes(q) ||
            m.league.name.toLowerCase().includes(q)
        );
        renderMatchList(filtered);
    } 
    else if (currentTab === 'teams') {
        const filtered = allTeams.filter(t => t.name.toLowerCase().includes(q));
        renderTeamGrid(filtered);
    } 
    else if (currentTab === 'players') {
        const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(q));
        renderPlayerGrid(filtered);
    }
}

function navigateTo(page) {
    // Gestion de la navigation principale (Matchs vs Actus)
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');
    
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    
    if (page === 'matches') {
        subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab')); // Reset sur TOUS
    } else {
        subTabs.style.display = 'none';
        currentTab = 'news';
        container.innerHTML = `<div class="match-card" onclick="window.open('https://www.hltv.org','_blank')" style="text-align:center;padding:40px;"><h3>HLTV NEWS</h3></div>`;
    }
}

function filterMatches(type, el) {
    // Gestion de la surbrillance des filtres (TOUS, EQUIPES, etc.)
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('global-search').value = ""; // Reset recherche à chaque changement d'onglet

    if (type === 'EQUIPES') {
        currentTab = 'teams';
        fetchAndRenderTeams();
    } else if (type === 'JOUEURS') {
        currentTab = 'players';
        fetchAndRenderPlayers();
    } else if (type === 'TOUS') {
        currentTab = 'matches';
        fetchAndRenderMatches();
    }
}

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING MATCHES...</div>`;
    currentMatches = await fetchData('matches');
    renderMatchList(currentMatches);
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD" };
        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:30%;text-align:center;">
                        <img src="${t1.image_url || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.6rem;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.2rem;font-weight:bold;">${m.results[0]?.score ?? 0} - ${m.results[1]?.score ?? 0}</div>
                    <div style="width:30%;text-align:center;">
                        <img src="${t2.image_url || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.6rem;">${t2.name}</div>
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
    container.innerHTML = `<div class="teams-grid">${list.map(t => `
        <div class="match-card" style="text-align:center;">
            <img src="${t.image_url || DEFAULT_LOGO}" style="width:40px;" onerror="this.src='${DEFAULT_LOGO}'">
            <div style="font-size:0.7rem;font-weight:bold;">${t.name}</div>
        </div>`).join('')}</div>`;
}

async function fetchAndRenderPlayers() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING PLAYERS...</div>`;
    if (allPlayers.length === 0) allPlayers = await fetchData('players');
    renderPlayerGrid(allPlayers);
}

function renderPlayerGrid(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="teams-grid">${list.map(p => `
        <div class="match-card" style="text-align:center;" onclick="openPlayerDetail('${p.id}')">
            <img src="${p.image_url || DEFAULT_LOGO}" style="width:40px;border-radius:50%;" onerror="this.src='${DEFAULT_LOGO}'">
            <div style="font-size:0.7rem;">${p.name}</div>
        </div>`).join('')}</div>`;
}

window.onload = () => navigateTo('matches');
