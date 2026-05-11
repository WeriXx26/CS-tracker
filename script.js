const API_URL = 'https://server-production-9224.up.railway.app'; 
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Erreur Fetch:", e);
        return [];
    }
}

// CETTE FONCTION DÉBLOQUE TES ONGLETS
function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if(activeNav) activeNav.classList.add('active');

    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    const searchWrapper = document.getElementById('search-wrapper');

    if (page === 'matches') {
        if(subTabs) subTabs.style.display = 'flex';
        if(searchWrapper) searchWrapper.style.display = 'block';
        fetchAndRenderMatches();
    } else {
        if(subTabs) subTabs.style.display = 'none';
        if(searchWrapper) searchWrapper.style.display = 'none';
        container.innerHTML = `<div class="match-card" style="text-align:center;padding:50px;"><h2>HLTV NEWS</h2><p>Bientôt disponible via RSS</p></div>`;
    }
}

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCING HLTV...</div>`;
    currentMatches = await fetchData('matches');
    renderMatchList(currentMatches);
}

function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;color:gray;">HLTV est inaccessible (Blocage 403) ou aucun match.</div>`;
        return;
    }

    container.innerHTML = list.map(m => `
        <div class="match-card">
            <div style="display:flex;justify-content:space-between;font-size:0.55rem;color:#888;margin-bottom:10px;">
                <span>${m.isLive ? '<b style="color:red;">● LIVE</b>' : m.status}</span>
                <span style="max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.event}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="width:35%;text-align:center;">
                    <img src="${m.logo1 || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                    <div style="font-size:0.65rem;font-weight:bold;margin-top:5px;">${m.team1}</div>
                </div>
                <div style="font-size:1.3rem;font-weight:900;color:${m.isLive ? '#ffb400' : '#fff'};">
                    ${m.score1} - ${m.score2}
                </div>
                <div style="width:35%;text-align:center;">
                    <img src="${m.logo2 || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                    <div style="font-size:0.65rem;font-weight:bold;margin-top:5px;">${m.team2}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialisation
window.onload = () => navigateTo('matches');
