/**
 * 1. CONFIGURATION
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; // <--- TON TOKEN ICI
const PROXY = 'https://corsproxy.io/?';
const API_URL = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=15';

// Stockage global pour les détails
let currentMatches = [];

/**
 * 2. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    // UI Onglets
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        fetchLiveMatches();
    } else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container); // Réintégration des news
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;font-family:Orbitron;font-size:0.7rem;">PROFIL JOUEUR</div>`;
    }
}

/**
 * 3. APPEL API MATCHS (PANDASCORE)
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; font-size:0.6rem; letter-spacing:2px;">SYNCHRONISATION LIVE...</div>`;

    try {
        const response = await fetch(PROXY + encodeURIComponent(`${API_URL}&token=${PANDA_TOKEN}`));
        if (!response.ok) throw new Error();
        const data = await response.json();

        if (data && data.length > 0) {
            currentMatches = data; // On stocke pour les détails
            renderMatches(data);
        } else {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match disponible.</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red; font-size:0.7rem;">ERREUR API (Vérifie ton Token)</div>`;
    }
}

function renderMatches(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = "";

    list.forEach(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        const isLive = m.status === "running";

        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})" style="border-left: 3px solid ${isLive ? 'red' : 'transparent'}; animation: fadeIn 0.4s; cursor:pointer;">
                <div style="font-size:0.5rem; color:var(--gray); margin-bottom:10px; display:flex; justify-content:space-between;">
                    <span>${m.league.name}</span>
                    <span style="color:var(--accent);">${isLive ? '● LIVE' : 'UPCOMING'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
                    <div style="width:35%; text-align:center;">
                        <img src="${t1.image_url || 'https://via.placeholder.com/40'}" width="35">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px;">${t1.name}</div>
                    </div>
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.5rem; font-weight:900; color:white;">${m.results[0].score} - ${m.results[1].score}</div>
                    </div>
                    <div style="width:35%; text-align:center;">
                        <img src="${t2.image_url || 'https://via.placeholder.com/40'}" width="35">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    });
}

/**
 * 4. SYSTÈME DE NEWS (RÉINTÉGRÉ)
 */
function renderNews(container) {
    const newsData = [
        { title: "Notes de Patch CS2", desc: "Valve ajuste l'économie et le recul des armes.", img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg", url: "https://www.counter-strike.net/news" },
        { title: "Classement HLTV", desc: "Vitality conserve sa place de leader mondial.", img: "https://img.vavel.com/b/Vitality_CS2.jpg", url: "https://www.hltv.org/ranking/teams" }
    ];

    container.innerHTML = `
        <h2 style="font-family:Orbitron; font-size:0.8rem; margin-bottom:20px; text-align:center; color:var(--accent);">ACTUS LIVE</h2>
        ${newsData.map(art => `
            <div class="news-card" onclick="window.location.href='${art.url}'" style="cursor:pointer; margin-bottom:20px;">
                <img src="${art.img}" style="width:100%; height:150px; object-fit:cover;">
                <div style="padding:15px; background:var(--card);">
                    <h3 style="font-size:0.9rem; margin:0; color:white;">${art.title}</h3>
                    <p style="font-size:0.75rem; color:var(--gray); margin-top:8px;">${art.desc}</p>
                </div>
            </div>
        `).join('')}`;
}

/**
 * 5. VUE DÉTAIL (ADAPTÉE À PANDASCORE)
 */
function openMatchDetail(id) {
    const m = currentMatches.find(match => match.id == id);
    const view = document.getElementById('match-detail');
    if (!m || !view) return;

    const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
    const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px; overflow-y:auto; animation: fadeIn 0.3s;">
            <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer; color:black;">← RETOUR</button>
            <div style="text-align:center; margin-top:40px;">
                <div style="color:var(--accent); font-family:Orbitron; font-size:0.6rem; margin-bottom:10px;">${m.league.name}</div>
                <div style="display:flex; justify-content:space-around; align-items:center; background:var(--card); padding:20px; border-radius:15px;">
                    <div><img src="${t1.image_url}" width="50"><h4>${t1.name}</h4></div>
                    <div style="font-size:2rem; font-weight:900;">${m.results[0].score} : ${m.results[1].score}</div>
                    <div><img src="${t2.image_url}" width="50"><h4>${t2.name}</h4></div>
                </div>
                <div style="margin-top:30px; background:rgba(255,255,255,0.05); padding:20px; border-radius:15px;">
                    <h4 style="font-family:Orbitron; font-size:0.7rem;">PROBABILITÉS</h4>
                    <div style="height:10px; background:#333; border-radius:5px; margin-top:10px; overflow:hidden;">
                        <div style="width:50%; height:100%; background:var(--accent);"></div>
                    </div>
                </div>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() {
    document.getElementById('match-detail').style.display = 'none';
}

window.onload = () => navigateTo('matches');
