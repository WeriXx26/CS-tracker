/**
 * 1. CONFIGURATION
 * REMPLACE PAR TON URL RAILWAY REÉLLE
 */
const API_URL = 'https://server-production-9224.up.railway.app'; 

let currentMatches = [];
let allTeams = [];
let allPlayers = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];

/**
 * 2. MOTEUR DE RÉCUPÉRATION
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) throw new Error("Erreur serveur");
        return await response.json();
    } catch (e) {
        console.error("Erreur API:", e);
        return null;
    }
}

/**
 * 3. NAVIGATION (Celle qui manquait !)
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const searchWrapper = document.getElementById('search-wrapper');
    const subTabs = document.getElementById('sub-tabs');
    
    // Surbrillance des onglets
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if(activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    if (page === 'matches') {
        searchWrapper.style.display = 'block';
        subTabs.style.display = 'flex';
        fetchAndRenderMatches();
    } else {
        searchWrapper.style.display = 'none';
        subTabs.style.display = 'none';
        container.innerHTML = `
            <div class="match-card" onclick="window.open('https://www.hltv.org','_blank')" style="text-align:center;padding:40px;">
                <h3 style="font-family:Orbitron; color:#ffb400;">HLTV NEWS</h3>
                <p style="color:gray;font-size:0.7rem;margin-top:10px;">Cliquez pour l'actu en direct.</p>
            </div>`;
    }
}

/**
 * 4. LOGIQUE MATCHS
 */
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING MATCHES...</div>`;
    
    const data = await fetchData('matches');
    if (data) {
        currentMatches = data;
        renderMatchList(currentMatches);
    } else {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:red;">Serveur injoignable</div>`;
    }
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">Aucun match trouvé.</div>`;
        return;
    }

    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        const isLive = m.status === 'running';
        const time = new Date(m.begin_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
        
        return `
            <div class="match-card" onclick="openMatchDetail('${m.id}')">
                <div style="display:flex; justify-content:space-between; font-size:0.5rem; font-family:Orbitron; color:gray; margin-bottom:10px;">
                    <span>${isLive ? '<b class="live-badge">● LIVE</b>' : time}</span>
                    <span>${m.league.name}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;">
                        <img src="${t1.image_url}" width="25" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem;">${t1.name}</div>
                    </div>
                    <div style="font-size:1.1rem; font-weight:900;">${m.results[0]?.score ?? 0} - ${m.results[1]?.score ?? 0}</div>
                    <div style="width:30%; text-align:center;">
                        <img src="${t2.image_url}" width="25" onerror="this.src='https://via.placeholder.com/30'">
                        <div style="font-size:0.55rem;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

/**
 * 5. FILTRES & RECHERCHE
 */
function filterMatches(type, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    
    if(type === 'EQUIPES') fetchAndRenderTeams();
    else if(type === 'JOUEURS') fetchAndRenderPlayers();
    else if(type === 'FAVORIS') {
        const favs = currentMatches.filter(m => favorites.includes(m.opponents[0]?.opponent.name) || favorites.includes(m.opponents[1]?.opponent.name));
        renderMatchList(favs);
    } else fetchAndRenderMatches();
}

function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    const filtered = currentMatches.filter(m => 
        m.opponents[0]?.opponent.name.toLowerCase().includes(q) || 
        m.opponents[1]?.opponent.name.toLowerCase().includes(q) || 
        m.league.name.toLowerCase().includes(q)
    );
    renderMatchList(filtered);
}

/**
 * 6. ÉQUIPES & JOUEURS
 */
async function fetchAndRenderTeams() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING TEAMS...</div>`;
    if (allTeams.length === 0) allTeams = await fetchData('teams');
    
    container.innerHTML = `<div class="teams-grid">${allTeams.map((t, i) => `
        <div class="match-card" style="text-align:center;">
            <span style="position:absolute;top:5px;left:5px;font-size:0.5rem;color:gray;">#${i+1}</span>
            <img src="${t.image_url}" style="width:35px;height:35px;object-fit:contain;">
            <div style="font-size:0.6rem;font-weight:bold;margin:5px 0;">${t.name}</div>
            <button onclick="toggleFav('${t.name}')" style="width:100%;border:none;padding:5px;border-radius:5px;font-size:0.5rem;background:${favorites.includes(t.name)?'#ffb400':'#222'};color:${favorites.includes(t.name)?'#000':'#fff'};">
                ${favorites.includes(t.name)?'SUIVI':'SUIVRE'}
            </button>
        </div>`).join('')}</div>`;
}

async function fetchAndRenderPlayers() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING TOP 50...</div>`;
    if (allPlayers.length === 0) allPlayers = await fetchData('players');
    
    container.innerHTML = `<div class="teams-grid">${allPlayers.map((p, i) => `
        <div class="match-card" onclick="openPlayerDetail('${p.id}')" style="text-align:center;">
            <span style="position:absolute;top:5px;left:5px;font-size:0.5rem;color:gray;">#${i+1}</span>
            <img src="${p.image_url || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid #333;">
            <div style="font-size:0.6rem;font-weight:bold;margin-top:5px;">${p.name}</div>
        </div>`).join('')}</div>`;
}

/**
 * 7. MODALES & FAVORIS
 */
function toggleFav(n) {
    event.stopPropagation();
    favorites.includes(n) ? favorites = favorites.filter(f => f !== n) : favorites.push(n);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    fetchAndRenderTeams();
}

function openMatchDetail(id) {
    const m = currentMatches.find(x => x.id == id);
    if(!m) return;
    const d = document.getElementById('match-detail');
    d.style.display = 'block';
    d.innerHTML = `
        <div style="padding:20px;text-align:center;background:#000;height:100vh;">
            <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400;border:none;padding:10px 20px;border-radius:10px;font-family:Orbitron;cursor:pointer;">RETOUR</button>
            <h3 style="margin-top:30px;color:#ffb400;">${m.league.name}</h3>
            <div style="display:flex;justify-content:space-around;align-items:center;margin-top:40px;">
                <div><img src="${m.opponents[0]?.opponent.image_url}" width="50"><div>${m.opponents[0]?.opponent.name}</div></div>
                <div style="font-size:2rem;font-weight:900;">${m.results[0]?.score ?? 0}:${m.results[1]?.score ?? 0}</div>
                <div><img src="${m.opponents[1]?.opponent.image_url}" width="50"><div>${m.opponents[1]?.opponent.name}</div></div>
            </div>
        </div>`;
}

function openPlayerDetail(id) {
    const p = allPlayers.find(x => x.id == id);
    if(!p) return;
    const d = document.getElementById('match-detail');
    d.style.display = 'block';
    d.innerHTML = `
        <div style="padding:20px;text-align:center;background:#000;height:100vh;">
            <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400;border:none;padding:10px 20px;border-radius:10px;font-family:Orbitron;cursor:pointer;">RETOUR</button>
            <div style="margin-top:40px;">
                <img src="${p.image_url || 'https://via.placeholder.com/100'}" width="100" style="border-radius:50%;border:2px solid #ffb400;">
                <h2 style="margin-top:10px;">${p.name}</h2>
                <p style="color:gray;">${p.first_name || ''} ${p.last_name || ''}</p>
            </div>
            <button onclick="window.open('https://www.hltv.org/search?query=${p.name}','_blank')" style="margin-top:40px;width:100%;padding:15px;background:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">VOIR HLTV</button>
        </div>`;
}

// Lancement automatique au chargement
window.onload = () => navigateTo('matches');
