/**
 * 1. DONNÉES STATIQUES (MATCHS)
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" }
];

let favorites = [];

/**
 * 2. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    // Mise à jour visuelle des onglets
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab'));
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        renderNews(container); // Appel de la fonction API
    } else {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;">PROFIL BIENTÔT DISPONIBLE</div>`;
    }
}

/**
 * 3. SYSTÈME DE NEWS (API TEMPS RÉEL)
 */
async function renderNews(container) {
    // Affichage d'un loader pendant l'attente
    container.innerHTML = `
        <div style="text-align:center; padding:50px; color:var(--accent); animation: pulse 1.5s infinite;">
            <div style="font-family:Orbitron; font-size:0.8rem; letter-spacing:2px;">SYNCHRONISATION DES FLUX...</div>
        </div>`;

    try {
        // On utilise un flux RSS Esport converti en JSON
        const rssUrl = 'https://www.team-aaa.com/rss/news.xml'; 
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok') {
            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease-out;">
                    <h2 style="font-family:Orbitron; font-size:0.9rem; margin-bottom:20px; text-align:center; color:var(--accent); letter-spacing:2px;">ACTUALITÉS TEMPS RÉEL</h2>
                    ${data.items.slice(0, 10).map(art => `
                        <div class="news-card" onclick="window.open('${art.link}', '_blank')" style="cursor:pointer; animation: fadeIn 0.4s;">
                            <img src="${art.thumbnail || 'https://via.placeholder.com/400x200?text=CS2+Esport'}" onerror="this.src='https://via.placeholder.com/400x200?text=CS2+News'">
                            <div class="news-content">
                                <h3 style="font-size:0.85rem; line-height:1.3; margin:0;">${art.title}</h3>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                                    <span style="font-size:0.6rem; color:var(--accent); font-weight:bold;">TEAM-AAA</span>
                                    <span style="font-size:0.6rem; color:var(--gray);">${art.pubDate.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            throw new Error();
        }
    } catch (error) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <p style="color:red; font-size:0.8rem;">Erreur de connexion aux serveurs de news.</p>
                <button onclick="navigateTo('news')" style="background:transparent; border:1px solid var(--accent); color:var(--accent); padding:10px; border-radius:5px; margin-top:10px;">RÉESSAYER</button>
            </div>`;
    }
}

/**
 * 4. GESTION DES MATCHS
 */
function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    if (type === 'FAVORIS') filtered = matches.filter(m => favorites.includes(m.team1));

    renderList(filtered);
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = "";
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
    view.innerHTML = `
        <div style="padding:20px; color:white;">
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

function closeDetail() { document.getElementById('match-detail').style.display = 'none'; }

// Init
window.onload = () => navigateTo('matches');
