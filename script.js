/**
 * 1. CONFIGURATION & VARIABLES GLOBALES
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; // <--- METS TON TOKEN PANDASCORE ICI
const PROXY = 'https://corsproxy.io/?';
const API_URL = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';

let currentMatches = []; // Stockage des matchs récupérés par l'API
let favorites = ['Vitality', 'G2', 'FaZe', 'Natus Vincere']; // Tes équipes suivies

/**
 * 2. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    // Mise à jour visuelle des onglets du haut
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        fetchLiveMatches(); // Lance l'appel API
    } else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:gray; font-family:Orbitron; font-size:0.7rem;">
                <h2 style="color:var(--accent);">PROFIL</h2>
                <p>Équipes suivies : ${favorites.join(', ')}</p>
            </div>`;
    }
}

/**
 * 3. APPEL API PANDASCORE (MATCHS RÉELS)
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; font-size:0.6rem; letter-spacing:2px;">SYNCHRONISATION LIVE...</div>`;

    try {
        const response = await fetch(PROXY + encodeURIComponent(`${API_URL}&token=${PANDA_TOKEN}`));
        if (!response.ok) throw new Error('Erreur API');
        const data = await response.json();

        if (data && data.length > 0) {
            currentMatches = data;
            // Par défaut, on affiche tout et on active le premier sous-onglet
            const firstTab = document.querySelector('.tab');
            filterMatches('TOUS', firstTab);
        } else {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match disponible.</div>`;
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#ff4444; font-size:0.7rem;">ERREUR DE CONNEXION API</div>`;
    }
}

/**
 * 4. FILTRES (TOUS / LIVE / FAVORIS)
 */
function filterMatches(type, element) {
    const container = document.getElementById('match-list');
    if (!container) return;

    // Style des sous-onglets
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');

    let filtered = [];
    if (type === 'TOUS') {
        filtered = currentMatches;
    } else if (type === 'LIVE') {
        filtered = currentMatches.filter(m => m.status === 'running');
    } else if (type === 'FAVORIS') {
        filtered = currentMatches.filter(m => {
            const t1 = m.opponents[0]?.opponent?.name || "";
            const t2 = m.opponents[1]?.opponent?.name || "";
            return favorites.includes(t1) || favorites.includes(t2);
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:gray; font-size:0.7rem;">AUCUN MATCH ${type} ACTUELLEMENT</div>`;
    } else {
        renderMatchesList(filtered);
    }
}

function renderMatchesList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = "";

    list.forEach(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        const isLive = m.status === "running";
        const score1 = m.results[0]?.score || 0;
        const score2 = m.results[1]?.score || 0;

        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})" style="border-left: 3px solid ${isLive ? 'var(--accent)' : 'transparent'}; cursor:pointer; animation: fadeIn 0.3s;">
                <div style="font-size:0.5rem; color:var(--gray); margin-bottom:10px; display:flex; justify-content:space-between;">
                    <span>${m.league.name}</span>
                    <span style="color:${isLive ? 'red' : 'var(--gray)'}; font-weight:bold;">${isLive ? '● LIVE' : 'SOON'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
                    <div style="width:35%; text-align:center;">
                        <img src="${t1.image_url || 'https://via.placeholder.com/40'}" width="35" style="height:35px; object-fit:contain;">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px;">${t1.name}</div>
                    </div>
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.5rem; font-weight:900; color:white;">${score1} - ${score2}</div>
                    </div>
                    <div style="width:35%; text-align:center;">
                        <img src="${t2.image_url || 'https://via.placeholder.com/40'}" width="35" style="height:35px; object-fit:contain;">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    });
}

/**
 * 5. SYSTÈME DE NEWS
 */
function renderNews(container) {
    const newsData = [
        {
            title: "Mise à jour CS2 : Notes de patch",
            desc: "Valve ajuste l'économie et le recul des armes sur les cartes compétitives.",
            img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg",
            url: "https://www.counter-strike.net/news"
        },
        {
            title: "Classement Mondial HLTV",
            desc: "Le top 20 mondial évolue après les derniers tournois de la saison.",
            img: "https://img.vavel.com/b/Vitality_CS2.jpg",
            url: "https://www.hltv.org/ranking/teams"
        }
    ];

    container.innerHTML = `
        <h2 style="font-family:Orbitron; font-size:0.8rem; margin-bottom:20px; text-align:center; color:var(--accent);">ACTUALITÉS</h2>
        ${newsData.map(art => `
            <div class="news-card" onclick="window.location.href='${art.url}'" style="cursor:pointer; margin-bottom:20px; background:var(--card); border-radius:15px; overflow:hidden;">
                <img src="${art.img}" style="width:100%; height:150px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3 style="font-size:0.9rem; margin:0; color:white;">${art.title}</h3>
                    <p style="font-size:0.75rem; color:var(--gray); margin-top:8px;">${art.desc}</p>
                </div>
            </div>
        `).join('')}`;
}

/**
 * 6. VUE DÉTAILLÉE
 */
function openMatchDetail(id) {
    const m = currentMatches.find(match => match.id == id);
    const view = document.getElementById('match-detail');
    if (!m || !view) return;

    const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
    const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
    const score1 = m.results[0]?.score || 0;
    const score2 = m.results[1]?.score || 0;

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px; overflow-y:auto;">
            <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer; color:black;">← RETOUR</button>
            <div style="text-align:center; margin-top:40px;">
                <div style="color:var(--accent); font-family:Orbitron; font-size:0.6rem; margin-bottom:10px; letter-spacing:2px;">${m.league.name}</div>
                <div style="display:flex; justify-content:space-around; align-items:center; background:var(--card); padding:30px 10px; border-radius:20px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="width:35%;"><img src="${t1.image_url}" width="50"><h4>${t1.name}</h4></div>
                    <div style="width:30%; font-size:2.2rem; font-weight:900; color:var(--accent);">${score1} : ${score2}</div>
                    <div style="width:35%;"><img src="${t2.image_url}" width="50"><h4>${t2.name}</h4></div>
                </div>
                <div style="margin-top:30px; background:rgba(255,255,255,0.02); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.05);">
                    <h4 style="font-family:Orbitron; font-size:0.7rem; margin-bottom:15px;">DÉTAILS DU MATCH</h4>
                    <p style="font-size:0.8rem; color:var(--gray);">Format : ${m.match_type.toUpperCase()} ${m.number_of_games}</p>
                    <p style="font-size:0.8rem; color:var(--gray);">Date : ${new Date(m.begin_at).toLocaleString()}</p>
                </div>
                <button onclick="window.location.href='https://www.twitch.tv/directory/game/Counter-Strike%202'" style="width:100%; margin-top:30px; padding:20px; background:#9146ff; color:white; border:none; border-radius:15px; font-weight:bold; font-family:Orbitron; cursor:pointer;">VOIR SUR TWITCH</button>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

// Lancement automatique sur l'onglet Matchs
window.onload = () => navigateTo('matches');
