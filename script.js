/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; 
const PROXY = 'https://corsproxy.io/?'; 
// On trie par statut (running d'abord) puis par date de début
const API_BASE = 'https://api.pandascore.co/csgo/matches?sort=status,-begin_at';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 1;
let currentTab = 'TOUS';

/**
 * 2. NAVIGATION & RECHERCHE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const searchWrapper = document.getElementById('search-wrapper');
    const subTabs = document.getElementById('sub-tabs');
    
    container.innerHTML = "";
    if (page === 'matches') {
        searchWrapper.style.display = 'block';
        subTabs.style.display = 'flex';
        fetchAndRenderMatches(true);
    } else {
        searchWrapper.style.display = 'none';
        subTabs.style.display = 'none';
        if(page === 'news') renderNews(container);
    }
}

function handleSearch() {
    const query = document.getElementById('global-search').value.toLowerCase();
    const filtered = currentMatches.filter(m => {
        const team1 = m.opponents[0]?.opponent.name.toLowerCase() || "";
        const team2 = m.opponents[1]?.opponent.name.toLowerCase() || "";
        const league = m.league.name.toLowerCase();
        return team1.includes(query) || team2.includes(query) || league.includes(query);
    });
    renderMatchList(filtered, false);
}

/**
 * 3. LOGIQUE MATCHS (AVEC PAGINATION)
 */
async function fetchAndRenderMatches(isNew = true) {
    if(isNew) {
        currentPage = 1;
        currentMatches = [];
    }
    
    const container = document.getElementById('match-list');
    if(isNew) container.innerHTML = `<div class="loader">SYNCING...</div>`;

    const url = `${API_BASE}&page=${currentPage}&per_page=20&token=${PANDA_TOKEN}`;
    const response = await fetch(PROXY + encodeURIComponent(url));
    const data = await response.json();

    if (data && Array.isArray(data)) {
        currentMatches = isNew ? data : [...currentMatches, ...data];
        renderMatchList(currentMatches, true);
    }
}

function renderMatchList(list, showLoadMore) {
    const container = document.getElementById('match-list');
    
    const html = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/30" };
        const isLive = m.status === 'running';
        const date = new Date(m.begin_at);
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')" style="border-left: 3px solid ${isLive ? '#ff4444' : '#333'}">
                <div style="text-align:center; font-size:0.5rem; font-family:Orbitron; margin-bottom:10px;">
                    ${isLive ? '<span class="live-badge">● LIVE</span>' : '<span style="color:gray;">'+time+'</span>'}
                    <span style="color:gray; margin-left:10px;">${m.league.name}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:35%; text-align:center;">
                        <img src="${t1.image_url}" width="30">
                        <div style="font-size:0.6rem; margin-top:5px;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.2rem; font-weight:900;">${m.results[0]?.score} - ${m.results[1]?.score}</div>
                    <div style="width:35%; text-align:center;">
                        <img src="${t2.image_url}" width="30">
                        <div style="font-size:0.6rem; margin-top:5px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = html;

    if (showLoadMore && list.length >= 20) {
        container.innerHTML += `
            <button onclick="loadMore()" style="width:100%; padding:15px; background:#222; color:white; border:none; border-radius:10px; font-family:Orbitron; margin-top:10px;">
                VOIR PLUS DE MATCHS
            </button>`;
    }
}

function loadMore() {
    currentPage++;
    fetchAndRenderMatches(false);
}

/**
 * 4. LOGIQUE ÉQUIPES (TOP 100)
 */
async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING TEAMS...</div>`;

    if (allTeams.length === 0) {
        const url = `https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100&token=${PANDA_TOKEN}`;
        const response = await fetch(PROXY + encodeURIComponent(url));
        allTeams = await response.json();
    }

    container.innerHTML = `<div class="teams-grid">
        ${allTeams.map((team, index) => {
            const isFav = favorites.includes(team.name);
            return `
                <div class="match-card" style="text-align:center;">
                    <span style="font-size:0.5rem; color:gray;">#${index+1}</span>
                    <img src="${team.image_url}" style="width:40px; height:40px; object-fit:contain; margin:10px auto;">
                    <div style="font-size:0.6rem; font-weight:bold;">${team.name}</div>
                    <button onclick="toggleFav('${team.name}')" style="background:${isFav ? '#ffb400' : '#333'}; color:${isFav ? 'black' : 'white'};">
                        ${isFav ? 'SUIVI' : 'SUIVRE'}
                    </button>
                </div>`;
        }).join('')}
    </div>`;
}

/**
 * 5. FILTRES & HELPERS
 */
function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    currentTab = type;
    
    if(type === 'EQUIPES') fetchAndRenderTeams();
    else if(type === 'FAVORIS') {
        const favs = currentMatches.filter(m => favorites.includes(m.opponents[0]?.opponent.name) || favorites.includes(m.opponents[1]?.opponent.name));
        renderMatchList(favs, false);
    } else fetchAndRenderMatches(true);
}

function toggleFav(name) {
    favorites.includes(name) ? favorites = favorites.filter(f => f !== name) : favorites.push(name);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    fetchAndRenderTeams();
}

function renderNews(c) {
    c.innerHTML = `<div class="match-card" onclick="window.open('https://www.hltv.org')"><h3>ACTUS HLTV</h3><p>Voir le site officiel</p></div>`;
}

function openMatchDetail(id) {
    const detail = document.getElementById('match-detail');
    detail.style.display = 'block';
    detail.innerHTML = `<div style="padding:20px; text-align:center;">
        <button onclick="document.getElementById('match-detail').style.display='none'">RETOUR</button>
        <h2>MATCH ID: ${id}</h2>
    </div>`;
}

window.onload = () => navigateTo('matches');
