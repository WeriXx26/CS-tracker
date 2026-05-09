/**
 * 1. DONNÉES STATIQUES
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" }
];

let favorites = [];

/**
 * 2. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab'));
    } else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;">PROFIL BIENTÔT DISPONIBLE</div>`;
    }
}

/**
 * 3. SYSTÈME DE NEWS (API) - VERSION ROBUSTE
 */
async function renderNews(container) {
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent);">CHARGEMENT...</div>`;

    // Utilisation d'un autre agrégateur gratuit (Webhose ou similaire via rss2json avec clé publique)
    const rssUrl = 'https://www.team-aaa.com/rss/news.xml';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Erreur Réseau');
        
        const data = await response.json();

        if (data.status === 'ok') {
            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease-out;">
                    <h2 style="font-family:Orbitron; font-size:0.9rem; margin-bottom:20px; text-align:center; color:var(--accent);">DERNIÈRES ACTUS</h2>
                    ${data.items.slice(0, 8).map(art => {
                        // On cherche une image dans le contenu si thumbnail est vide
                        const thumb = art.thumbnail || art.enclosure.link || 'https://via.placeholder.com/400x200?text=CS2+News';
                        return `
                        <div class="news-card" onclick="window.open('${art.link}', '_blank')" style="margin-bottom:15px; cursor:pointer;">
                            <img src="${thumb}" style="width:100%; height:150px; object-fit:cover; border-radius:12px 12px 0 0;">
                            <div class="news-content" style="background:var(--card); padding:12px; border-radius:0 0 12px 12px;">
                                <h3 style="font-size:0.8rem; margin:0; color:white;">${art.title}</h3>
                                <p style="font-size:0.6rem; color:var(--accent); margin-top:5px;">Lire la suite →</p>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`;
        } else {
            throw new Error('Flux invalide');
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="color:#ff4444; font-size:0.8rem;">Impossible de charger les news en direct.</p>
                <button onclick="navigateTo('news')" style="margin-top:15px; background:var(--accent); border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">RÉESSAYER</button>
            </div>`;
    }
}

/**
 * 4. LOGIQUE DES MATCHS
 */
function filterMatches(type, element) {
    const container = document.getElementById('match-list');
    if (!container) return;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    
    container.innerHTML = "";
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    
    renderList(filtered);
}

function renderList(list) {
    const container = document.getElementById('match-list');
    list.forEach(m => {
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div>${m.team1}</div></div>
                    <div style="text-align:center;"><div style="font-size:1.4rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.5rem; color:gray;">${m.status}</div></div>
                    <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div>${m.team2}</div></div>
                </div>
            </div>`;
    });
}

/**
 * 5. VUE DÉTAIL
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    if (!m || !view) return;

    view.innerHTML = `
        <div style="padding:20px; color:white; height:100vh; background:var(--bg);">
            <button onclick="closeDetail()" style="background:var(--accent); border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">← RETOUR</button>
            <div style="text-align:center; margin-top:40px;">
                <h2 style="font-family:Orbitron; color:var(--accent);">${m.team1} vs ${m.team2}</h2>
                <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:20px; margin-top:20px;">
                    <div style="font-size:3rem; font-weight:900; color:var(--accent);">${m.score}</div>
                </div>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { 
    document.getElementById('match-detail').style.display = 'none'; 
}

window.onload = () => navigateTo('matches');
