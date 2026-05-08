/**
 * 1. DONNÉES DE L'APPLICATION
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';

/**
 * 2. NAVIGATION PRINCIPALE
 */
function navigateTo(page) {
    // On ferme toujours le détail quand on change d'onglet
    closeDetail();
    
    currentPage = page;
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');

    // Mise à jour visuelle des onglets du haut
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab'));
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `
            <div style="text-align:center; padding:50px; animation: fadeIn 0.5s;">
                <h2 style="font-family:Orbitron; color:var(--accent); font-size:1rem;">BIENTÔT DISPONIBLE</h2>
                <p style="color:var(--gray); font-size:0.8rem; margin-top:10px;">L'onglet ${page} est en cours de développement.</p>
            </div>`;
    }
}

/**
 * 3. LOGIQUE DES MATCHS
 */
function filterMatches(type, element) {
    if (element) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
    }
    
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    if (type === 'FAVORIS' || type === 'FAV') {
        filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));
    }

    renderList(filtered);
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:gray; margin-top:30px;">Aucun match trouvé</div>`;
        return;
    }

    list.forEach(m => {
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})" style="cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;">
                        <img src="${m.logo1}" width="35">
                        <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team1}</div>
                    </div>
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.3rem; font-weight:900; color:var(--accent);">${m.score}</div>
                        <div style="font-size:0.6rem; color:var(--gray); margin-top:5px; letter-spacing:1px;">${m.status}</div>
                    </div>
                    <div style="width:30%; text-align:center;">
                        <img src="${m.logo2}" width="35">
                        <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${m.team2}</div>
                    </div>
                </div>
            </div>`;
    });
}

/**
 * 4. VUE DÉTAILLÉE (STATS)
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    
    if (!m || !view) return;

    // Simulation de statistiques pour le rendu visuel
    const winRate = 62;
    const adr = 78;

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px; overflow-y:auto; animation: fadeIn 0.3s;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <button onclick="closeDetail()" style="background:rgba(255,180,0,0.1); color:var(--accent); border:1px solid var(--accent); padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">← RETOUR</button>
                <span style="font-family:'Orbitron'; font-size:0.7rem; letter-spacing:2px; color:var(--accent);">ANALYSE LIVE</span>
                <div style="width:40px;"></div>
            </div>

            <div style="background:var(--card); border-radius:20px; padding:30px 15px; text-align:center; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <div style="width:35%;"><img src="${m.logo1}" width="55"><h4 style="margin:10px 0 0 0;">${m.team1}</h4></div>
                    <div style="width:30%;"><div style="font-size:2.2rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.6rem; color:var(--gray);">BO3</div></div>
                    <div style="width:35%;"><img src="${m.logo2}" width="55"><h4 style="margin:10px 0 0 0;">${m.team2}</h4></div>
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                <h3 style="font-family:'Orbitron'; font-size:0.7rem; margin-bottom:20px; color:var(--gray);">PROBABILITÉS & IMPACT</h3>
                
                <div style="margin-bottom:25px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Probabilité Victoire</span><span style="color:var(--accent);">${winRate}%</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:${winRate}%; height:100%; background:var(--accent);"></div></div>
                </div>

                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;"><span>Impact ADR</span><span style="color:var(--accent);">${adr}</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="width:${adr}%; height:100%; background:white; opacity:0.6;"></div></div>
                </div>
            </div>

            <button style="width:100%; margin-top:30px; padding:20px; background:#9146ff; color:white; border:none; border-radius:15px; font-weight:bold; font-family:'Orbitron'; cursor:pointer; font-size:0.8rem;">VOIR SUR TWITCH.TV</button>
        </div>
    `;

    view.style.display = 'block';
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

// Initialisation
window.onload = () => navigateTo('matches');
