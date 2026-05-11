// Remplace bien cette URL par ton URL Railway actuelle
const API_URL = 'https://server-production-9224.up.railway.app 
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];

/**
 * Fonction de navigation principale
 * Gère l'affichage des onglets et lance le chargement des données
 */
function navigateTo(page) {
    try {
        // Mise à jour visuelle des onglets
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeBtn = document.getElementById('nav-' + page);
        if (activeBtn) activeBtn.classList.add('active');

        const container = document.getElementById('match-list');
        const subTabs = document.getElementById('sub-tabs');
        const searchWrapper = document.getElementById('search-wrapper');

        if (page === 'matches') {
            if (subTabs) subTabs.style.display = 'flex';
            if (searchWrapper) searchWrapper.style.display = 'block';
            fetchAndRenderMatches();
        } else {
            // Mode ACTUS / NEWS
            if (subTabs) subTabs.style.display = 'none';
            if (searchWrapper) searchWrapper.style.display = 'none';
            container.innerHTML = `
                <div class="match-card" style="text-align:center; padding:60px 20px;">
                    <h2 style="color:#ffb400; font-family:Orbitron;">HLTV NEWS</h2>
                    <p style="color:gray; margin-top:15px;">Flux RSS en cours de configuration...</p>
                    <button onclick="window.open('https://www.hltv.org')" style="margin-top:20px; padding:10px 20px; background:#ffb400; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">VOIR HLTV.ORG</button>
                </div>`;
        }
    } catch (err) {
        console.error("Erreur de navigation :", err);
    }
}

/**
 * Récupère les matchs depuis ton serveur Railway (Hybride HLTV/Panda)
 */
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">SYNCHRONISATION CS2...<br><span style="font-size:0.6rem; color:gray;">(Peut prendre 20s via ScraperAPI)</span></div>`;
    
    try {
        // Timeout de 45 secondes pour laisser le temps au proxy de répondre
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(`${API_URL}/matches`, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json();
        currentMatches = Array.isArray(data) ? data : [];
        
        renderMatchList(currentMatches);
    } catch (error) {
        console.error("Erreur Fetch Matches :", error);
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#ff4444;">Le serveur met trop de temps à répondre.<br>Réessayez dans quelques instants.</div>`;
    }
}

/**
 * Affiche la liste des matchs avec la source et le score
 */
function renderMatchList(list) {
    const container = document.getElementById('match-list');
    
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:gray;">Aucun match en direct ou à venir trouvé.</div>`;
        return;
    }

    container.innerHTML = list.map(m => `
        <div class="match-card">
            <div style="display:flex; justify-content:space-between; font-size:0.55rem; font-family:Orbitron; color:#888; margin-bottom:10px;">
                <span>${m.isLive ? '<b style="color:#ff4444; animation:blink 1s infinite;">● LIVE</b>' : (m.status || 'PROCHAINEMENT')}</span>
                <span style="background:#222; padding:2px 6px; border-radius:4px; font-size:0.5rem;">SOURCE: ${m.source || 'CS2 API'}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:35%; text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="28" style="opacity:0.6; filter:grayscale(100%);" alt="logo">
                    <div style="font-size:0.7rem; font-weight:bold; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${m.team1}
                    </div>
                </div>

                <div style="font-size:1.4rem; font-weight:900; color:${m.isLive ? '#ffb400' : '#fff'}; letter-spacing:2px;">
                    ${m.score1} - ${m.score2}
                </div>

                <div style="width:35%; text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="28" style="opacity:0.6;
