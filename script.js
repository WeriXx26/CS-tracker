/**
 * 1. DONNÉES DE L'APPLICATION
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0" }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];

/**
 * 2. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    closeDetail();
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');

    // Update style des liens
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab'));
    } 
    else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } 
    else if (page === 'settings') {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `
            <div style="text-align:center; padding:50px; animation: fadeIn 0.5s;">
                <h2 style="font-family:Orbitron; color:var(--accent); font-size:1rem;">RÉGLAGES</h2>
                <button onclick="localStorage.clear(); location.reload();" style="margin-top:20px; background:rgba(255,0,0,0.1); color:red; border:1px solid red; padding:15px; border-radius:12px; cursor:pointer; width:100%; font-weight:bold;">EFFACER LE CACHE</button>
            </div>`;
    }
}

/**
 * 3. SYSTÈME DE NEWS (L'onglet qui était vide)
 */
function renderNews(container) {
    const articles = [
        {
            title: "Le retour de Train ?",
            desc: "Des rumeurs persistantes indiquent que Valve prépare le retour de la map mythique pour la prochaine saison.",
            img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg"
        },
        {
            title: "Vitality en démonstration",
            desc: "L'équipe française confirme sa forme actuelle en dominant le classement mondial HLTV ce mois-ci.",
            img: "https://img.vavel.com/b/Vitality_CS2.jpg"
        }
    ];

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease-out;">
            <h2 style="font-family:Orbitron; font-size:0.9rem; margin-bottom:20px; text-align:center; color:var(--accent); letter-spacing:2px;">ACTUALITÉS</h2>
            ${articles.map(art => `
                <div class="news-card">
                    <img src="${art.img}">
                    <div class="news-content">
                        <h3>${art.title}</h3>
                        <p>${art.desc}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 4. LOGIQUE DES MATCHS
 */
function filterMatches(type, element) {
    if (element) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
    }
    
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    if (type === 'FAVORIS') filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));

    renderList(filtered);
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    list.forEach(m => {
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
                    <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team1}</div></div>
                    <div style="text-align:center; flex:1;"><div style="font-size:1.3rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.5rem; color:var(--gray);">${m.status}</div></div>
                    <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team2}</div></div>
                </div>
            </div>`;
    });
}

/**
 * 5. VUE DÉTAIL (STATS)
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    if (!m || !view) return;

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px; overflow-y:auto; animation: fadeIn 0.3s;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <button onclick="closeDetail()" style="background:rgba(255,180,0,0.1); color:var(--accent); border:1px solid var(--accent); padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">← RETOUR</button>
                <span style="font-family:'Orbitron'; font-size:0.75rem; color:var(--accent); letter-spacing:2px;">DIRECT ANALYTICS</span>
                <div style="width:40px;"></div>
            </div>

            <div style="background:var(--card); border-radius:20px; padding:30px 10px; text-align:center; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <div style="width:35%;"><img src="${m.logo1}" width="55"><h4>${m.team1}</h4></div>
                    <div style="width:30%;"><div style="font-size:2.2rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.6rem; color:var(--gray);">LIVE</div></div>
                    <div style="width:35%;"><img src="${m.logo2}" width="55"><h4>${m.team2}</h4></div>
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Probabilité de victoire</span><span style="color:var(--accent);">65%</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:65%; height:100%; background:var(--accent);"></div></div>
                </div>
                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Impact ADR</span><span style="color:var(--accent);">84.2</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:84%; height:100%; background:white; opacity:0.6;"></div></div>
                </div>
            </div>

            <button style="width:100%; margin-top:30px; padding:20px; background:#9146ff; color:white; border:none; border-radius:15px; font-weight:bold; font-family:'Orbitron'; cursor:pointer;">REGARDER SUR TWITCH</button>
        </div>`;
    
    view.style.display = 'block';
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

window.onload = () => navigateTo('matches');
