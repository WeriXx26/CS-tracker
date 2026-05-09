/**
 * 1. CONFIGURATION
 * Remplace l'URL ci-dessous par celle que Vercel t'a donnée après ton déploiement.
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'.trim(); 
const PROXY_URL = 'https://proxy-cs2.vercel.app/'; // <--- TA NOUVELLE URL VERCEL

const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';
const API_TEAMS_TOP100 = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

let currentMatches = [];
let allTeams = []; 
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2', 'FaZe'];
let currentUser = JSON.parse(localStorage.getItem('cs2_user')) || null;

/**
 * 2. MOTEUR DE RÉCUPÉRATION VIA VERCEL
 */
async function apiFetch(targetUrl) {
    try {
        // On construit l'URL complète : Proxy + (URL API + Token)
        const fullUrl = PROXY_URL + encodeURIComponent(`${targetUrl}&token=${PANDA_TOKEN}`);
        
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Erreur de connexion via le Proxy Perso:", e);
        return { error: "ERREUR_PROXY" };
    }
}

/**
 * 3. NAVIGATION PRINCIPALE
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
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; letter-spacing:2px; font-size:0.6rem;">SYNCHRONISATION VERCEL...</div>`;
    
    const data = await apiFetch(API_MATCHS);
    
    if (data.error) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:red; font-size:0.7rem;">ÉCHEC DE CONNEXION AU PROXY VERCEL</div>`;
    } else {
        currentMatches = data;
        filterMatches('TOUS', document.querySelector('.tab'));
    }
}

/**
 * 5. SYSTÈME ÉQUIPES (TOP 100)
 */
async function renderTeamsView(container) {
    container.innerHTML = `
        <div onclick="window.open('https://www.hltv.org/ranking/teams', '_blank')" 
             style="background:linear-gradient(90deg, #ffb400, #ff8c00); color:black; padding:15px; border-radius:12px; margin-bottom:15px; text-align:center; font-family:Orbitron; font-size:0.7rem; font-weight:900; cursor:pointer;">
             🏆 TOP 100 HLTV (LIVE)
        </div>
        <div id="teams-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div style="grid-column: span 2; text-align:center; color:var(--accent); padding:40px;">RÉCUPÉRATION DU TOP 100...</div>
        </div>
    `;

    if (allTeams.length === 0) {
        const data = await apiFetch(API_TEAMS_TOP100);
        if (data.error) {
            document.getElementById('teams-grid').innerHTML = `<div style="grid-column:span 2; color:red; text-align:center;">Erreur Proxy Équipes</div>`;
            return;
        }
        allTeams = Array.isArray(data) ? data.filter(t => t.name) : [];
    }
    
    const grid = document.getElementById('teams-grid');
    grid.innerHTML = allTeams.map((team, index) => {
        const isFav = favorites.includes(team.name);
        return `
            <div class="match-card" style="padding:15px; text-align:center; position:relative;">
                <div style="position:absolute; top:5px; left:8px; font-size:0.5rem; color:var(--gray);">#${index + 1}</div>
                <img src="${team.image_url || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:contain; margin-bottom:8px;">
                <div style="font-size:0.65rem; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${team.name}</div>
                <button onclick="toggleFavorite('${team.name}')" 
                        style="margin-top:10px; width:100%; border:none; background:${isFav ? 'var(--accent)' : '#222'}; color:${isFav ? 'black' : 'white'}; font-size:0.5rem; padding:6px; border-radius:6px; cursor:pointer;">
                        ${isFav ? 'SUIVI' : 'SUIVRE'}
                </button>
            </div>`;
    }).join('');
}

/**
 * 6. FILTRES, PROFIL ET MODALES (Stables)
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
    }).map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        return `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${t1.image_url}" width="30"><div>${t1.name}</div></div>
                    <div style="font-size:1.2rem; font-weight:900; color:var(--accent);">${m.results[0].score} - ${m.results[1].score}</div>
                    <div style="width:30%; text-align:center;"><img src="${t2.image_url}" width="30"><div>${t2.name}</div></div>
                </div>
            </div>`;
    }).join('');
}

function toggleFavorite(n) {
    favorites.includes(n) ? favorites = favorites.filter(f=>f!==n) : favorites.push(n);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    renderTeamsView(document.getElementById('match-list'));
}

function renderProfilPage(c) {
    if(!currentUser) {
        c.innerHTML = `<div style="padding:40px; text-align:center;"><h2 style="font-family:Orbitron; margin-bottom:20px;">PROFIL</h2><input id="l-u" placeholder="Pseudo" style="width:100%; padding:15px; background:#111; color:white; border:1px solid #333; border-radius:10px;"><button onclick="hL()" style="width:100%; padding:15px; background:var(--accent); margin-top:10px; border-radius:10px; font-weight:bold; cursor:pointer;">SE CONNECTER</button></div>`;
    } else {
        c.innerHTML = `<div style="padding:20px;"><h2 style="font-family:Orbitron;">${currentUser.username}</h2><div style="margin-top:15px; padding:15px; background:var(--card); border-radius:10px;">Équipes suivies : ${favorites.length}</div><button onclick="hLo()" style="margin-top:20px; color:red; background:none; border:1px solid red; padding:10px; border-radius:10px; cursor:pointer;">DÉCONNEXION</button></div>`;
    }
}

function hL() { const v = document.getElementById('l-u').value; if(v) { currentUser={username:v}; localStorage.setItem('cs2_user', JSON.stringify(currentUser)); navigateTo('settings'); }}
function hLo() { currentUser=null; localStorage.removeItem('cs2_user'); navigateTo('settings'); }
function renderNews(c) { c.innerHTML = `<div onclick="window.open('https://www.hltv.org/news', '_blank')" style="padding:20px; background:var(--card); border-radius:15px; cursor:pointer; text-align:center;"><h3>LIRE L'ACTUALITÉ SUR HLTV</h3><p style="color:var(--gray); font-size:0.7rem;">Toutes les news du circuit pro</p></div>`; }
function openMatchDetail(id) { document.getElementById('match-detail').style.display='block'; document.getElementById('match-detail').innerHTML=`<div style="padding:20px; background:var(--bg); height:100vh; text-align:center;"><button onclick="closeDetail()" style="padding:10px; background:var(--accent); border:none; border-radius:5px; font-weight:bold;">RETOUR</button><div style="margin-top:50px; font-family:Orbitron;">DÉTAILS DU MATCH</div></div>`; }
function closeDetail() { document.getElementById('match-detail').style.display='none'; }

window.onload = () => navigateTo('matches');
