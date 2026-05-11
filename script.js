const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

let currentMatches = [];
let currentData = []; // Stocke les données de l'onglet actif (matchs, équipes ou joueurs)
let currentTab = 'matches';

/**
 * NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const btn = document.getElementById('nav-' + page);
    if (btn) btn.classList.add('active');

    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    const searchWrapper = document.getElementById('search-wrapper');

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        searchWrapper.style.display = 'block';
        filterContent('TOUS', document.querySelector('.tab.active') || document.querySelector('.tab'));
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        searchWrapper.style.display = 'none';
        fetchAndRenderNews();
    }
}

/**
 * FILTRAGE DES SOUS-ONGLETS (Matchs, Équipes, Joueurs)
 */
async function filterContent(type, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">CHARGEMENT ${type}...</div>`;

    if (type === 'EQUIPES' || type === 'JOUEURS') {
        // Simule des données pour ces onglets en attendant ton API complète
        // Utilise les noms des équipes des matchs pour peupler la liste
        const mockData = type === 'EQUIPES' 
            ? ["Vitality", "FaZe", "NaVi", "G2", "Astralis", "MOUZ", "Spirit", "Liquid"]
            : ["ZywOo", "NiKo", "m0NESY", "donk", "dev1ce", "ropz", "sh1ro", "EliGE"];
        
        renderGrid(mockData, type);
    } else {
        fetchAndRenderMatches();
    }
}

/**
 * RÉCUPÉRATION DES MATCHS (HYBRIDE)
 */
async function fetchAndRenderMatches() {
    try {
        const res = await fetch(`${API_URL}/matches`);
        const data = await res.json();
        currentMatches = data;
        renderMatchList(data);
    } catch (e) {
        document.getElementById('match-list').innerHTML = `<div style="text-align:center;padding:20px;">Erreur serveur.</div>`;
    }
}

/**
 * RÉCUPÉRATION DES NEWS (RSS HLTV via Proxy)
 */
async function fetchAndRenderNews() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">LECTURE DU FLUX HLTV...</div>`;
    
    try {
        // On utilise un proxy public pour lire le RSS de HLTV sans être bloqué par le CORS
        const rssUrl = encodeURIComponent('https://www.hltv.org/rss/news');
        const res = await fetch(`https://api.allorigins.win/get?url=${rssUrl}`);
        const json = await res.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(json.contents, "text/xml");
        const items = xml.querySelectorAll("item");

        let html = `<h2 style="font-family:Orbitron;color:#ffb400;padding:10px;font-size:1rem;">DERNIÈRES NEWS</h2>`;
        items.forEach((item, i) => {
            if(i < 8) {
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const date = new Date(item.querySelector("pubDate").textContent).toLocaleDateString('fr-FR');
                html += `
                    <div class="match-card" onclick="window.open('${link}', '_blank')" style="cursor:pointer;border-left:3px solid #ffb400;">
                        <div style="font-size:0.5rem;color:#888;">${date}</div>
                        <div style="font-size:0.75rem;font-weight:bold;margin-top:5px;line-height:1.2;">${title}</div>
                        <div style="text-align:right;font-size:0.5rem;color:#ffb400;margin-top:5px;">LIRE SUR HLTV ></div>
                    </div>`;
            }
        });
        container.innerHTML = html || "Aucune news trouvée.";
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Impossible de charger les news.</div>`;
    }
}

/**
 * RENDU DES GRILLES (Equipes / Joueurs)
 */
function renderGrid(data, type) {
    const container = document.getElementById('match-list');
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:5px;">
            ${data.map(name => `
                <div class="match-card" style="text-align:center;padding:20px;">
                    <img src="${DEFAULT_LOGO}" width="40" style="opacity:0.3;margin-bottom:10px;">
                    <div style="font-size:0.8rem;font-weight:bold;">${name.toUpperCase()}</div>
                    <div style="font-size:0.5rem;color:#666;margin-top:5px;">${type === 'EQUIPES' ? 'TEAM PRO' : 'PRO PLAYER'}</div>
                </div>
            `).join('')}
        </div>`;
}

/**
 * RENDU DE LA LISTE DE MATCHS
 */
function renderMatchList(list) {
    const container = document.getElementById('match-list');
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Aucun match en cours.</div>`;
        return;
    }

    container.innerHTML = list.map((m, i) => `
        <div class="match-card" onclick="alert('Détails: ${m.team1} vs ${m.team2}')">
            <div style="display:flex;justify-content:space-between;font-size:0.55rem;color:#888;margin-bottom:10px;">
                <span>${m.isLive ? '<b style="color:red;animation:blink 1s infinite;">● LIVE</b>' : m.status}</span>
                <span style="background:#222;padding:2px 5px;border-radius:3px;font-size:0.5rem;">${m.source}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="width:35%;text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                    <div style="font-size:0.7rem;font-weight:bold;margin-top:5px;">${m.team1}</div>
                </div>
                <div style="font-size:1.3rem;font-weight:900;color:${m.isLive ? '#ffb400' : '#fff'};">${m.score1} - ${m.score2}</div>
                <div style="width:35%;text-align:center;">
                    <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                    <div style="font-size:0.7rem;font-weight:bold;margin-top:5px;">${m.team2}</div>
                </div>
            </div>
            <div style="font-size:0.5rem;text-align:center;color:#444;margin-top:8px;">${m.event}</div>
        </div>
    `).join('');
}

/**
 * RECHERCHE
 */
function handleSearch() {
    const q = document.getElementById('global-search').value.toLowerCase();
    const cards = document.querySelectorAll('.match-card');
    cards.forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
}

window.onload = () => navigateTo('matches');
