/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'hyW11mB7JjyRHvjcqoZvmy1qvpuZbyhpuCqGIntAPWfjHlyq9ZM'; // <-- Mets ton token ici
const PROXY = 'https://corsproxy.io/?'; // Le premier proxy utilisé

const API_MATCHS = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';
const API_TEAMS = 'https://api.pandascore.co/csgo/teams?sort=-videogame_score&per_page=100';

let currentMatches = [];
let allTeams = [];
let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || ['Vitality', 'G2'];

/**
 * 2. MOTEUR DE RÉCUPÉRATION (Simplifié au maximum)
 */
async function fetchData(url) {
    try {
        // Construction de l'URL : Proxy + (URL API avec Token)
        const target = encodeURIComponent(url + '&token=' + PANDA_TOKEN);
        const response = await fetch(PROXY + target);
        
        if (!response.ok) throw new Error("Erreur HTTP " + response.status);
        
        return await response.json();
    } catch (e) {
        console.error("Erreur de connexion :", e);
        return null;
    }
}

/**
 * 3. NAVIGATION & AFFICHAGE MATCHS
 */
async function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    container.innerHTML = "";
    if (page === 'matches') {
        subTabs.style.display = 'flex';
        renderMatchesView();
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="padding:20px; text-align:center;"><h3>ACTUALITÉ</h3><p>Flux HLTV en attente du serveur.</p></div>`;
    }
}

async function renderMatchesView() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron;">LOADING...</div>`;
    
    const data = await fetchData(API_MATCHS);
    if (data && Array.isArray(data)) {
        currentMatches = data;
        renderList(currentMatches);
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red; font-size:0.8rem;">ERREUR DE RÉCEPTION<br>Vérifie ton Token ou ton bloqueur de pub.</div>`;
    }
}

function renderList(list) {
    const container = document.getElementById('match-list');
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">Aucun match en cours.</div>`;
        return;
    }
    container.innerHTML = list.map(m => `
        <div class="match-card" onclick="openMatchDetail(${m.id})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:35%; text-align:center;">
                    <img src="${m.opponents[0]?.opponent.image_url || ''}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                    <div style="font-size:0.6rem; margin-top:5px;">${m.opponents[0]?.opponent.name || 'TBD'}</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.2rem; font-weight:bold; color:#ffb400;">
                        ${m.results[0]?.score ?? 0} - ${m.results[1]?.score ?? 0}
                    </div>
                    <div style="font-size:0.4rem; color:gray;">${m.status.toUpperCase()}</div>
                </div>
                <div style="width:35%; text-align:center;">
                    <img src="${m.opponents[1]?.opponent.image_url || ''}" width="30" onerror="this.src='https://via.placeholder.com/30'">
                    <div style="font-size:0.6rem; margin-top:5px;">${m.opponents[1]?.opponent.name || 'TBD'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 4. ÉQUIPES (TOP 100)
 */
async function renderTeamsView() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#ffb400; font-family:Orbitron;">SYNCING TOP 100...</div>`;
    
    if (allTeams.length === 0) {
        const data = await fetchData(API_TEAMS);
        if (data && Array.isArray(data)) allTeams = data;
    }

    if (allTeams.length > 0) {
        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
                ${allTeams.map((team, index) => {
                    const isFav = favorites.includes(team.name);
                    return `
                    <div class="match-card" style="text-align:center; padding:15px; position:relative;">
                        <span style="position:absolute; top:5px; left:5px; font-size:0.5rem; color:gray;">#${index+1}</span>
                        <img src="${team.image_url || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:contain; margin-bottom:10px;">
                        <div style="font-size:0.7rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${team.name}</div>
                        <button onclick="toggleFavorite('${team.name}')" style="margin-top:10px; width:100%; border:none; background:${isFav ? '#ffb400' : '#222'}; color:${isFav ? 'black' : 'white'}; padding:5px; border-radius:5px; font-size:0.5rem; font-weight:bold; cursor:pointer;">
                            ${isFav ? 'SUIVI' : 'SUIVRE'}
                        </button>
                    </div>`;
                }).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Erreur lors du chargement des équipes.</div>`;
    }
}

/**
 * 5. LOGIQUE FAVORIS & TAB
 */
function filterMatches(type, element) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    if (type === 'EQUIPES') {
        renderTeamsView();
    } else {
        renderMatchesView();
    }
}

function toggleFavorite(name) {
    if (favorites.includes(name)) {
        favorites = favorites.filter(f => f !== name);
    } else {
        favorites.push(name);
    }
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    renderTeamsView(); // Rafraîchit l'affichage
}

function openMatchDetail(id) {
    const detail = document.getElementById('match-detail');
    detail.style.display = 'block';
    detail.innerHTML = `<div style="padding:20px; text-align:center; background:#000; height:100vh;">
        <button onclick="document.getElementById('match-detail').style.display='none'" style="background:#ffb400; border:none; padding:10px; border-radius:5px; font-weight:bold;">RETOUR</button>
        <h2 style="margin-top:50px; font-family:Orbitron; color:#ffb400;">DÉTAILS</h2>
        <p style="color:gray;">ID du match : ${id}</p>
    </div>`;
}

// Lancement au démarrage
window.onload = () => navigateTo('matches');
