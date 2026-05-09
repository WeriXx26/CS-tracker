/**
 * 1. CONFIGURATION SIMPLE
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; // <-- Mets ta clé PandaScore ici
const PROXY = 'https://api.allorigins.win/raw?url='; // Proxy public sans configuration

const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';
const API_TEAMS = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2'];

/**
 * 2. FONCTION DE RÉCUPÉRATION
 */
async function fetchData(url) {
    try {
        const fullUrl = PROXY + encodeURIComponent(url + '&token=' + PANDA_TOKEN);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (e) {
        console.error("Erreur API, vérifie ton Token ou le Proxy");
        return null;
    }
}

/**
 * 3. NAVIGATION & AFFICHAGE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    container.innerHTML = "";
    if (page === 'matches') {
        subTabs.style.display = 'flex';
        renderMatchesView();
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="padding:20px; text-align:center;"><h3>ACTUALITÉ</h3><p>Flux HLTV bientôt disponible.</p></div>`;
    }
}

async function renderMatchesView() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400;">CHARGEMENT...</div>`;
    
    const data = await fetchData(API_MATCHS);
    if (data) {
        currentMatches = data;
        renderList(currentMatches);
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Erreur de connexion. Vérifie ton Token PandaScore.</div>`;
    }
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = list.map(m => `
        <div class="match-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:35%; text-align:center;">
                    <img src="${m.opponents[0]?.opponent.image_url || ''}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                    <div style="font-size:0.6rem;">${m.opponents[0]?.opponent.name || 'TBD'}</div>
                </div>
                <div style="font-size:1.2rem; font-weight:bold; color:#ffb400;">
                    ${m.results[0].score} - ${m.results[1].score}
                </div>
                <div style="width:35%; text-align:center;">
                    <img src="${m.opponents[1]?.opponent.image_url || ''}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                    <div style="font-size:0.6rem;">${m.opponents[1]?.opponent.name || 'TBD'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 4. ONGLET ÉQUIPES (TOP 100)
 */
async function renderTeamsView() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400;">RÉCUPÉRATION DU TOP 100...</div>`;
    
    if (allTeams.length === 0) {
        const data = await fetchData(API_TEAMS);
        if (data) allTeams = data;
    }

    if (allTeams.length > 0) {
        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
                ${allTeams.map((team, index) => `
                    <div class="match-card" style="text-align:center; padding:15px; position:relative;">
                        <span style="position:absolute; top:5px; left:5px; font-size:0.5rem; color:gray;">#${index+1}</span>
                        <img src="${team.image_url || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:contain; margin-bottom:10px;">
                        <div style="font-size:0.7rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${team.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Impossible de charger les équipes.</div>`;
    }
}

// Pour faire marcher l'onglet équipes quand on clique sur le menu
function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    if (type === 'EQUIPES') {
        renderTeamsView();
    } else {
        renderMatchesView();
    }
}

window.onload = () => navigateTo('matches');
