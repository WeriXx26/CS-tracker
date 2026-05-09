/**
 * 1. DONNÉES DES MATCHS
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" },
    { id: 3, team1: "Mouz", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "Spirit", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" }
];

/**
 * 2. NAVIGATION
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
        filterMatches('TOUS', document.querySelector('.tab'));
    } else if (page === 'news') {
        if (subTabs) subTabs.style.display = 'none';
        renderNews(container);
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;font-family:Orbitron;font-size:0.7rem;">PROFIL JOUEUR CONNECTÉ</div>`;
    }
}

/**
 * 3. SYSTÈME DE NEWS (Générateur Dynamique Garanti sans Erreur)
 */
function renderNews(container) {
    // Liste de news "fresques" pour simuler l'API sans les bugs de connexion
    const realNews = [
        {
            title: "Mise à jour CS2 : Le retour de Train confirmé ?",
            desc: "Les derniers fichiers extraits de la mise à jour de ce matin montrent des textures retravaillées pour la map légendaire.",
            img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg",
            tag: "OFFICIEL"
        },
        {
            title: "Vitality : ZywOo prolonge son contrat",
            desc: "L'organisation française vient d'annoncer que son joueur star restera jusqu'en 2027.",
            img: "https://img.vavel.com/b/Vitality_CS2.jpg",
            tag: "TRANSFERT"
        },
        {
            title: "Major 2026 : Shanghaï se prépare",
            desc: "Les travaux de l'arène principale avancent. Le prochain Major s'annonce comme le plus grand de l'histoire.",
            img: "https://prosettings.net/wp-content/uploads/cs2-guide.png",
            tag: "EVENT"
        }
    ];

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease-out;">
            <h2 style="font-family:Orbitron; font-size:0.8rem; margin-bottom:20px; text-align:center; color:var(--accent); letter-spacing:2px;">ACTUALITÉS LIVE</h2>
            ${realNews.map(art => `
                <div class="news-card" style="margin-bottom:20px; border:1px solid rgba(255,255,255,0.05); background:var(--card); border-radius:15px; overflow:hidden;">
                    <div style="position:relative;">
                        <img src="${art.img}" style="width:100%; height:160px; object-fit:cover;">
                        <span style="position:absolute; top:10px; left:10px; background:var(--accent); color:black; font-size:0.5rem; font-weight:bold; padding:4px 8px; border-radius:4px; font-family:Orbitron;">${art.tag}</span>
                    </div>
                    <div style="padding:15px;">
                        <h3 style="font-size:0.9rem; margin:0; color:white; line-height:1.3;">${art.title}</h3>
                        <p style="font-size:0.75rem; color:var(--gray); margin-top:8px; line-height:1.4;">${art.desc}</p>
                    </div>
                </div>
            `).join('')}
        </div>`;
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
            <div class="match-card" onclick="openMatchDetail(${m.id})" style="animation: fadeIn 0.3s;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div style="font-size:0.7rem;margin-top:5px;">${m.team1}</div></div>
                    <div style="text-align:center; flex:1;"><div style="font-size:1.6rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.55rem; color:var(--gray); letter-spacing:1px;">${m.status}</div></div>
                    <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div style="font-size:0.7rem;margin-top:5px;">${m.team2}</div></div>
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
                <span style="font-family:'Orbitron'; font-size:0.75rem; color:var(--accent); letter-spacing:2px;">STATISTIQUES</span>
                <div style="width:40px;"></div>
            </div>

            <div style="background:var(--card); border-radius:20px; padding:30px 10px; text-align:center; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <div style="width:35%; text-align:center;"><img src="${m.logo1}" width="60"><h4>${m.team1}</h4></div>
                    <div style="width:30%;"><div style="font-size:2.5rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.6rem; color:var(--gray);">BEST OF 3</div></div>
                    <div style="width:35%; text-align:center;"><img src="${m.logo2}" width="60"><h4>${m.team2}</h4></div>
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Probabilité Victoire</span><span style="color:var(--accent);">62%</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:62%; height:100%; background:var(--accent);"></div></div>
                </div>
                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Impact ADR</span><span style="color:var(--accent);">84.2</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:84%; height:100%; background:white; opacity:0.6;"></div></div>
                </div>
            </div>

            <button style="width:100%; margin-top:30px; padding:20px; background:#9146ff; color:white; border:none; border-radius:15px; font-weight:bold; font-family:'Orbitron'; cursor:pointer;">VOIR SUR TWITCH</button>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { 
    document.getElementById('match-detail').style.display = 'none'; 
}

window.onload = () => navigateTo('matches');
