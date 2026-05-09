/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; 
const PROXY = 'https://corsproxy.io/?';
const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';

// On utilise un tri par "videogame_score" décroissant pour simuler le ranking mondial HLTV
const API_TEAMS_TOP100 = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100'; 

let currentMatches = [];
let allTeams = []; 
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2', 'FaZe'];
let currentUser = JSON.parse(localStorage.getItem('cs2_user')) || null;

/**
 * 2. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + (page === 'settings' ? 'settings' : page));
    if (activeNav) activeNav.classList.add('active');
    
    container.innerHTML = "";
    closeDetail();
    
    if (page === 'matches') {
        subTabs.style.display = 'flex';
        fetchLiveMatches();
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        renderNews(container);
    } else if (page === 'settings') {
        subTabs.style.display = 'none';
        renderProfilPage(container);
    }
}

/**
 * 3. SYSTÈME ÉQUIPES (TOP 100 HLTV FOCUS)
 */
async function renderTeamsView(container) {
    container.innerHTML = `
        <div onclick="window.location.href='https://www.hltv.org/ranking/teams'" 
             style="background:linear-gradient(90deg, #ffb400, #ff8c00); color:black; padding:15px; border-radius:12px; margin-bottom:15px; text-align:center; font-family:Orbitron; font-size:0.7rem; font-weight:900; cursor:pointer; box-shadow: 0 4px 15px rgba(255,180,0,0.2);">
             🏆 TOP 20 MONDIAL HLTV (LIVE)
        </div>

        <div style="margin-bottom:20px;">
            <input type="text" id="team-search" placeholder="Rechercher dans le Top 100..." oninput="applyTeamFilters()"
                   style="width:100%; padding:12px; background:var(--card); border:1px solid #333; color:white; border-radius:10px; margin-bottom:10px; font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0 5px;">
                <span style="font-size:0.6rem; color:var(--gray); font-family:Orbitron;">RANKING MONDIAL</span>
                <select id="team-sort" onchange="applyTeamFilters()" style="background:transparent; color:var(--accent); border:none; font-size:0.6rem; font-weight:bold; cursor:pointer;">
                    <option value="rank">PAR RANG</option>
                    <option value="alpha">A-Z</option>
                </select>
            </div>
        </div>

        <div id="teams-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div style="grid-column: span 2; text-align:center; color:var(--accent); font-size:0.6rem; padding:40px; font-family:Orbitron;">SYNCHRONISATION DU TOP 100...</div>
        </div>
    `;

    if (allTeams.length === 0) {
        try {
            const response = await fetch(PROXY + encodeURIComponent(`${API_TEAMS_TOP100}&token=${PANDA_TOKEN}`));
            allTeams = await response.json();
            // On ne garde que les équipes ayant un nom et une image pour le Top 100
            allTeams = allTeams.filter(t => t.name && t.image_url);
        } catch (e) {
            document.getElementById('teams-grid').innerHTML = "Erreur de chargement.";
            return;
        }
    }
    applyTeamFilters();
}

function applyTeamFilters() {
    const grid = document.getElementById('teams-grid');
    const query = document.getElementById('team-search').value.toLowerCase();
    const sortType = document.getElementById('team-sort').value;
    if (!grid) return;

    let filtered = allTeams.filter(t => t.name.toLowerCase().includes(query));
    
    if (sortType === 'alpha') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    grid.innerHTML = filtered.map((team, index) => {
        const isFav = favorites.includes(team.name);
        // On affiche un rang fictif basé sur le videogame_score (très proche du HLTV)
        const rank = index + 1; 
        
        return `
            <div class="match-card" style="padding:15px; text-align:center; position:relative; overflow:hidden;">
                <div style="position:absolute; top:5px; left:8px; font-size:0.55rem; font-family:Orbitron; color:var(--gray); opacity:0.5;">#${rank}</div>
                <img src="${team.image_url}" width="40" style="height:40px; object-fit:contain; margin-top:5px;">
                <div style="font-size:0.7rem; font-weight:bold; margin-top:8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${team.name}</div>
                <div style="display:flex; justify-content:center; gap:5px; margin-top:10px;">
                    <button onclick="openTeamStats('${team.name}')" style="background:#333; border:none; color:white; font-size:0.5rem; padding:5px 8px; border-radius:4px; cursor:pointer;">STATS</button>
                    <button onclick="toggleFavorite('${team.name}')" 
                            style="background:${isFav ? 'var(--accent)' : 'transparent'}; border:1px solid var(--accent); color:${isFav ? 'black' : 'var(--accent)'}; font-size:0.5rem; padding:5px 8px; border-radius:4px; cursor:pointer;">
                            ${isFav ? 'FAV' : '+'}
                    </button>
                </div>
            </div>`;
    }).join('');
}

/**
 * 4. LOGIQUE MATCHS, NEWS & FAVORIS (Reste identique pour la stabilité)
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-size:0.6rem;">SYNC...</div>`;
    try {
        const response = await fetch(PROXY + encodeURIComponent(`${API_MATCHS}&token=${PANDA_TOKEN}`));
        currentMatches = await response.json();
        filterMatches('TOUS', document.querySelector('.tab'));
    } catch (e) { container.innerHTML = "Erreur API."; }
}

function filterMatches(type, element) {
    const container = document.getElementById('match-list');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    container.innerHTML = "";
    if (type === 'EQUIPES') renderTeamsView(container);
    else {
        let filtered = currentMatches;
        if (type === 'LIVE') filtered = currentMatches.filter(m => m.status === 'running');
        if (type === 'FAVORIS') filtered = currentMatches.filter(m => {
            const t1 = m.opponents[0]?.opponent?.name || "";
            const t2 = m.opponents[1]?.opponent?.name || "";
            return favorites.includes(t1) || favorites.includes(t2);
        });
        renderMatchesList(filtered);
    }
}

function renderMatchesList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        return `<div class="match-card" onclick="openMatchDetail(${m.id})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:30%; text-align:center;"><img src="${t1.image_url}" width="30"><div style="font-size:0.6rem;">${t1.name}</div></div>
                <div style="text-align:center;"><div style="font-size:1.3rem; font-weight:900;">${m.results[0].score} - ${m.results[1].score}</div></div>
                <div style="width:30%; text-align:center;"><img src="${t2.image_url}" width="30"><div style="font-size:0.6rem;">${t2.name}</div></div>
            </div>
        </div>`;
    }).join('');
}

function renderNews(container) {
    container.innerHTML = `<div class="news-card" onclick="window.location.href='https://www.hltv.org/news'" style="padding:15px; background:var(--card); border-radius:15px; margin-bottom:10px; cursor:pointer;"><h3>Dernières News HLTV</h3><p>Consulter l'actu pro en direct.</p></div>`;
}

function renderProfilPage(container) {
    if (!currentUser) {
        container.innerHTML = `<div style="padding:30px; text-align:center;">
            <h2 style="font-family:Orbitron; color:var(--accent);">CONNEXION</h2>
            <input type="text" id="login-username" placeholder="Pseudo" style="width:100%; padding:15px; background:#000; color:white; border:1px solid #333; border-radius:10px; margin-top:20px;">
            <button onclick="handleLogin()" style="width:100%; padding:15px; background:var(--accent); border:none; border-radius:10px; font-weight:bold; margin-top:10px;">VALIDER</button>
        </div>`;
    } else {
        container.innerHTML = `<div style="padding:20px;">
            <h2 style="font-family:Orbitron; color:white; font-size:1rem;">PROFIL : ${currentUser.username}</h2>
            <div style="margin-top:20px; background:var(--card); padding:15px; border-radius:10px;">
                <h3 style="font-size:0.8rem;">MES FAVORIS (${favorites.length})</h3>
                <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px;">${favorites.map(f => `<span style="background:var(--accent); color:black; padding:4px 8px; border-radius:4px; font-size:0.6rem; font-weight:bold;">${f}</span>`).join('')}</div>
            </div>
            <button onclick="handleLogout()" style="width:100%; padding:10px; margin-top:20px; color:red; border:1px solid red; background:transparent; border-radius:10px;">DÉCONNEXION</button>
        </div>`;
    }
}

function toggleFavorite(teamName) {
    if (favorites.includes(teamName)) favorites = favorites.filter(f => f !== teamName);
    else favorites.push(teamName);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    applyTeamFilters(); 
}

function handleLogin() {
    const user = document.getElementById('login-username').value;
    if (user) { currentUser = { username: user }; localStorage.setItem('cs2_user', JSON.stringify(currentUser)); navigateTo('settings'); }
}
function handleLogout() { currentUser = null; localStorage.removeItem('cs2_user'); navigateTo('settings'); }

function openMatchDetail(id) {
    const m = currentMatches.find(match => match.id == id);
    if (!m) return;
    const view = document.getElementById('match-detail');
    view.innerHTML = `<div style="padding:20px; background:var(--bg); height:100vh;">
        <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px; border-radius:5px; font-weight:bold;">RETOUR</button>
        <h2 style="text-align:center; margin-top:40px; font-family:Orbitron;">${m.league.name}</h2>
        <div style="text-align:center; font-size:2rem; margin-top:20px; color:var(--accent); font-weight:900;">${m.results[0].score} - ${m.results[1].score}</div>
    </div>`;
    view.style.display = 'block';
}

function openTeamStats(teamName) {
    const view = document.getElementById('match-detail');
    view.innerHTML = `
        <div style="padding:20px; background:var(--bg); height:100vh; text-align:center;">
            <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px; border-radius:5px; font-weight:bold;">RETOUR</button>
            <h2 style="margin-top:40px; color:var(--accent); font-family:Orbitron;">${teamName}</h2>
            <div style="background:var(--card); padding:20px; border-radius:15px; margin-top:20px;">
                <p>Equipe du Top 100 Mondial</p>
                <div style="display:flex; justify-content:space-around; margin-top:20px; color:var(--accent); font-weight:bold;">
                    <div>WINRATE<br>62%</div>
                    <div>RANK<br>TOP 100</div>
                </div>
            </div>
            <button onclick="window.location.href='https://www.hltv.org/search?query=${encodeURIComponent(teamName)}'" 
                    style="width:100%; padding:15px; margin-top:30px; background:white; color:black; font-weight:bold; border-radius:10px; font-family:Orbitron; font-size:0.7rem;">
                    FICHE HLTV COMPLÈTE
            </button>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { document.getElementById('match-detail').style.display = 'none'; }

window.onload = () => navigateTo('matches');
