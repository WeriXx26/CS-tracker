const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];

// 1. GESTION DE LA NAVIGATION (Fixe les onglets)
function navigateTo(page) {
    // Mise à jour visuelle des boutons
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    const searchWrapper = document.getElementById('search-wrapper');

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        if (searchWrapper) searchWrapper.style.display = 'block';
        fetchAndRenderMatches();
    } else {
        if (subTabs) subTabs.style.display = 'none';
        if (searchWrapper) searchWrapper.style.display = 'none';
        container.innerHTML = `
            <div class="match-card" style="text-align:center; padding:60px 20px;">
                <h2 style="color:#ffb400; font-family:Orbitron;">HLTV NEWS</h2>
                <p style="color:gray; margin-top:15px;">Les actus arrivent bientôt.</p>
            </div>`;
    }
}

// 2. RÉCUPÉRATION DES MATCHS
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">CHARGEMENT...</div>`;
    
    try {
        const res = await fetch(`${API_URL}/matches`);
        const data = await res.json();
        currentMatches = data;
        renderMatchList(data);
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Erreur de connexion.</div>`;
    }
}

// 3. AFFICHAGE DE LA LISTE (Fixe le clic sur le match)
function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Aucun match disponible.</div>`;
        return;
    }

    container.innerHTML = list.map((m, index) => `
        <div class="match-card" onclick="openMatchDetail(${index})" style="cursor:pointer;">
            <div style="display:flex; justify-content:space-between; font-size:0.55rem; color:#888; margin-bottom:10px;">
                <span>${m.status}</span>
                <span style="background:#222; padding:2px 5px; border-radius:3px;">${m.source}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:35%; text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                    <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team1}</div>
                </div>
                <div style="font-size:1.3rem; font-weight:900; color:${m.isLive ? '#ffb400' : '#fff'};">
                    ${m.score1} - ${m.score2}
                </div>
                <div style="width:35%; text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                    <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team2}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. DÉTAILS DU MATCH (La fonction qui manquait)
function openMatchDetail(index) {
    const m = currentMatches[index];
    alert("Détails du match : " + m.team1 + " vs " + m.team2 + "\nTournoi : " + m.event);
}

// 5. RECHERCHE
function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    const filtered = currentMatches.filter(m => 
        m.team1.toLowerCase().includes(q) || 
        m.team2.toLowerCase().includes(q) || 
        m.event.toLowerCase().includes(q)
    );
    renderMatchList(filtered);
}

// LANCEMENT
window.onload = () => navigateTo('matches');
