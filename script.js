const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];

// NAVIGATION PRINCIPALE
function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const btn = document.getElementById('nav-' + page);
    if (btn) btn.classList.add('active');

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
        fetchAndRenderNews();
    }
}

// NAVIGATION SECONDAIRE (Sous-onglets)
async function filterContent(type, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">CHARGEMENT ${type}...</div>`;

    if (type === 'EQUIPES') {
        renderGrid(["Vitality", "FaZe", "G2", "NaVi", "Astralis", "Mouz", "Spirit", "Liquid"], "TEAM");
    } else if (type === 'JOUEURS') {
        renderGrid(["ZywOo", "NiKo", "m0NESY", "donk", "dev1ce", "ropz", "sh1ro", "EliGE"], "PLAYER");
    } else if (type === 'FAVORIS') {
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;">Aucun favori enregistré.</div>`;
    } else {
        fetchAndRenderMatches();
    }
}

// RÉCUPÉRATION MATCHS (Railway)
async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    try {
        const res = await fetch(`${API_URL}/matches`);
        const data = await res.json();
        currentMatches = data;
        
        container.innerHTML = data.map(m => `
            <div class="match-card">
                <div style="display:flex;justify-content:space-between;font-size:0.55rem;color:#888;margin-bottom:10px;">
                    <span>${m.status}</span>
                    <span style="background:#222;padding:2px 5px;border-radius:3px;font-size:0.5rem;">${m.source}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:35%;text-align:center;">
                        <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.4;">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:5px;">${m.team1}</div>
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;color:${m.status === 'LIVE' ? '#ffb400' : '#fff'};">
                        ${m.score1} - ${m.score2}
                    </div>
                    <div style="width:35%;text-align:center;">
                        <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.4;">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:5px;">${m.team2}</div>
                    </div>
                </div>
                <div style="font-size:0.5rem;text-align:center;color:#444;margin-top:8px;">${m.event}</div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Erreur de connexion.</div>`;
    }
}

// RÉCUPÉRATION NEWS (RSS HLTV)
async function fetchAndRenderNews() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">LECTURE HLTV...</div>`;
    try {
        // Nouveau Proxy plus fiable pour le RSS
        const rssUrl = 'https://www.hltv.org/rss/news';
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        let html = '<div style="padding:10px;">';
        items.forEach((item, i) => {
            if (i < 10) {
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const pubDate = item.querySelector("pubDate") ? item.querySelector("pubDate").textContent.split(' ').slice(1,4).join(' ') : "";
                
                html += `
                    <div class="match-card" onclick="window.open('${link}', '_blank')" style="cursor:pointer; margin-bottom:12px; border-left:3px solid #ffb400; padding:15px;">
                        <div style="font-size:0.5rem;color:#ffb400;margin-bottom:5px;font-family:Orbitron;">${pubDate}</div>
                        <div style="font-size:0.8rem;font-weight:bold;line-height:1.3;">${title}</div>
                        <div style="font-size:0.55rem;color:#555;margin-top:8px;text-align:right;">LIRE L'ARTICLE ➔</div>
                    </div>`;
            }
        });
        container.innerHTML = html + '</div>';
    } catch (e) {
        console.error("RSS Error:", e);
        container.innerHTML = `<div style="text-align:center;padding:20px;color:gray;">Impossible de charger HLTV.<br><small>Essayez de rafraîchir la page.</small></div>`;
    }
}

// RENDU GRILLES (Equipes/Joueurs)
function renderGrid(data, label) {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;padding:15px;">` + 
        data.map(item => `
            <div class="match-card" style="text-align:center;padding:25px 10px;">
                <img src="${DEFAULT_LOGO}" width="30" style="opacity:0.15;margin-bottom:10px;">
                <div style="font-size:0.75rem;font-weight:bold;font-family:Orbitron;">${item.toUpperCase()}</div>
                <div style="font-size:0.5rem;color:#444;margin-top:5px;letter-spacing:1px;">PRO ${label}</div>
            </div>
        `).join('') + `</div>`;
}

// RECHERCHE
function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    document.querySelectorAll('.match-card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
}

window.onload = () => navigateTo('matches');
