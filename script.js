/**
 * 1. CONFIGURATION & ÉTAT
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; 
const PROXY = 'https://corsproxy.io/?';
const API_URL = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=20';

let currentMatches = [];
let favorites = ['Vitality', 'G2', 'FaZe'];

// Gestion de l'utilisateur (Sauvegardé sur le téléphone)
let currentUser = JSON.parse(localStorage.getItem('cs2_user')) || null;

/**
 * 2. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + (page === 'settings' ? 'settings' : page));
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        fetchLiveMatches();
    } else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } else if (page === 'settings') {
        if (subTabs) subTabs.style.display = 'none';
        renderProfilPage(container);
    }
}

/**
 * 3. LOGIQUE DE CONNEXION / PROFIL
 */
function renderProfilPage(container) {
    if (!currentUser) {
        // Formulaire de connexion
        container.innerHTML = `
            <div style="padding: 30px; animation: fadeIn 0.5s; text-align: center;">
                <h2 style="font-family:Orbitron; color:var(--accent); margin-bottom:10px;">CONNEXION</h2>
                <p style="font-size:0.7rem; color:gray; margin-bottom:30px;">Accédez à vos favoris et statistiques</p>
                
                <div style="background:var(--card); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.05);">
                    <input type="text" id="login-username" placeholder="Pseudo" style="width:100%; padding:15px; background:#000; border:1px solid #333; color:white; border-radius:10px; margin-bottom:15px;">
                    <input type="password" id="login-pass" placeholder="Mot de passe" style="width:100%; padding:15px; background:#000; border:1px solid #333; color:white; border-radius:10px; margin-bottom:20px;">
                    <button onclick="handleLogin()" style="width:100%; padding:15px; background:var(--accent); border:none; border-radius:10px; font-weight:bold; font-family:Orbitron; cursor:pointer;">SE CONNECTER</button>
                </div>
            </div>`;
    } else {
        // Vue Profil Connecté
        container.innerHTML = `
            <div style="padding: 20px; animation: fadeIn 0.5s;">
                <div style="text-align:center; margin-bottom:30px;">
                    <div style="width:70px; height:70px; background:var(--accent); border-radius:50%; margin:0 auto 15px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:black; font-weight:900;">
                        ${currentUser.username.substring(0,2).toUpperCase()}
                    </div>
                    <h2 style="font-family:Orbitron; font-size:1.1rem; color:white; margin:0;">${currentUser.username.toUpperCase()}</h2>
                    <p style="color:var(--accent); font-size:0.6rem; letter-spacing:2px; margin-top:5px;">UTILISATEUR VÉRIFIÉ</p>
                </div>

                <div style="background:var(--card); border-radius:15px; padding:20px; margin-bottom:20px;">
                    <h3 style="font-family:Orbitron; font-size:0.7rem; color:gray; margin-bottom:15px;">VOS FAVORIS</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${favorites.map(f => `<span style="font-size:0.7rem; background:rgba(255,180,0,0.1); color:var(--accent); padding:5px 10px; border-radius:5px;">${f}</span>`).join('')}
                    </div>
                </div>

                <button onclick="handleLogout()" style="width:100%; padding:12px; background:transparent; border:1px solid #ff4444; color:#ff4444; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.7rem;">DÉCONNEXION</button>
            </div>`;
    }
}

function handleLogin() {
    const user = document.getElementById('login-username').value;
    if (user.length > 2) {
        currentUser = { username: user, loginDate: new Date() };
        localStorage.setItem('cs2_user', JSON.stringify(currentUser));
        navigateTo('settings');
    } else {
        alert("Pseudo trop court !");
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('cs2_user');
    navigateTo('settings');
}

/**
 * 4. API MATCHS (PANDASCORE)
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; font-size:0.6rem;">SYNCHRONISATION...</div>`;
    try {
        const response = await fetch(PROXY + encodeURIComponent(`${API_URL}&token=${PANDA_TOKEN}`));
        const data = await response.json();
        currentMatches = data;
        filterMatches('TOUS', document.querySelector('.tab'));
    } catch (e) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">ERREUR API</div>`;
    }
}

function filterMatches(type, element) {
    const container = document.getElementById('match-list');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    
    let filtered = currentMatches;
    if (type === 'LIVE') filtered = currentMatches.filter(m => m.status === 'running');
    if (type === 'FAVORIS') filtered = currentMatches.filter(m => {
        const t1 = m.opponents[0]?.opponent?.name || "";
        const t2 = m.opponents[1]?.opponent?.name || "";
        return favorites.includes(t1) || favorites.includes(t2);
    });

    renderMatchesList(filtered);
}

function renderMatchesList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = list.map(m => {
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        return `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${t1.image_url}" width="30"><div style="font-size:0.6rem;">${t1.name}</div></div>
                    <div style="text-align:center;"><div style="font-size:1.2rem; font-weight:900;">${m.results[0].score} - ${m.results[1].score}</div></div>
                    <div style="width:30%; text-align:center;"><img src="${t2.image_url}" width="30"><div style="font-size:0.6rem;">${t2.name}</div></div>
                </div>
            </div>`;
    }).join('');
}

/**
 * 5. SYSTÈME DE NEWS
 */
function renderNews(container) {
    const news = [
        { title: "Mise à jour CS2", desc: "Notes de patch sur l'économie.", url: "https://www.counter-strike.net/news" },
        { title: "Classement HLTV", desc: "Le top mondial actualisé.", url: "https://www.hltv.org/ranking/teams" }
    ];
    container.innerHTML = news.map(n => `
        <div class="news-card" onclick="window.location.href='${n.url}'" style="padding:15px; background:var(--card); border-radius:15px; margin-bottom:15px; cursor:pointer;">
            <h3 style="font-size:0.9rem; margin:0; color:var(--accent);">${n.title}</h3>
            <p style="font-size:0.7rem; color:gray; margin-top:5px;">${n.desc}</p>
        </div>`).join('');
}

/**
 * 6. VUE DÉTAILLÉE
 */
function openMatchDetail(id) {
    const m = currentMatches.find(match => match.id == id);
    const view = document.getElementById('match-detail');
    if (!m) return;
    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px;">
            <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px; border-radius:5px; font-weight:bold;">← RETOUR</button>
            <div style="text-align:center; margin-top:50px;">
                <h2 style="font-family:Orbitron;">${m.opponents[0]?.opponent.name} VS ${m.opponents[1]?.opponent.name}</h2>
                <p>${m.league.name}</p>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { document.getElementById('match-detail').style.display = 'none'; }

window.onload = () => navigateTo('matches');
