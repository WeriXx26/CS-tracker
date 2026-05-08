const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", score: "0 - 0" }
];

function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return; // Sécurité

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    if (page === 'matches') {
        if (subTabs) subTabs.style.display = 'flex';
        renderList(matches);
    } else {
        if (subTabs) subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center; padding:50px; color:white;">Onglet ${page} bientôt disponible.</div>`;
    }
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';
    list.forEach(m => {
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})" style="cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div>${m.team1}</div></div>
                    <div style="text-align:center; font-size:1.5rem; color:#ffb400; font-weight:bold;">${m.score}</div>
                    <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div>${m.team2}</div></div>
                </div>
            </div>`;
    });
}

function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    
    if (!m || !view) return;

    // Calcul de stats bidons pour le visuel (on pourra automatiser plus tard)
    const winRate = 65; 
    const adrTeam1 = 82;

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#0b0d10; color:white; z-index:10000; padding:20px; overflow-y:auto; animation: fadeIn 0.3s;">
            
            <!-- Header du détail -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <button onclick="closeDetail()" style="background:rgba(255,255,255,0.1); color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">←</button>
                <span style="font-family:'Orbitron'; font-size:0.8rem; color:var(--accent); letter-spacing:2px;">DÉTAILS DU MATCH</span>
                <div style="width:40px;"></div> <!-- Équilibre visuel -->
            </div>

            <!-- Score et Logos -->
            <div style="background:var(--card); border-radius:20px; padding:30px 10px; text-align:center; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <div style="width:30%;">
                        <img src="${m.logo1}" width="50" style="filter: drop-shadow(0 0 10px rgba(255,180,0,0.2));">
                        <div style="font-weight:bold; margin-top:10px; font-size:0.9rem;">${m.team1}</div>
                    </div>
                    <div style="width:30%;">
                        <div style="font-size:2.2rem; font-weight:900; color:var(--accent);">${m.score || '0 - 0'}</div>
                        <div style="font-size:0.6rem; color:var(--gray); letter-spacing:1px;">BO3</div>
                    </div>
                    <div style="width:30%;">
                        <img src="${m.logo2}" width="50">
                        <div style="font-weight:bold; margin-top:10px; font-size:0.9rem;">${m.team2}</div>
                    </div>
                </div>
            </div>

            <!-- Section Statistiques Réelles -->
            <div style="background:rgba(255,255,255,0.02); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                <h3 style="font-family:'Orbitron'; font-size:0.7rem; margin-bottom:20px; color:var(--gray);">ANALYSE DES PERFORMANCES</h3>
                
                <!-- Win Probability -->
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;">
                        <span>Probabilité de victoire</span>
                        <span style="color:var(--accent);">${winRate}%</span>
                    </div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                        <div style="width:${winRate}%; height:100%; background:var(--accent); box-shadow: 0 0 10px var(--accent);"></div>
                    </div>
                </div>

                <!-- Team ADR -->
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:8px;">
                        <span>Dégâts moyens (ADR)</span>
                        <span style="color:var(--accent);">${adrTeam1}</span>
                    </div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                        <div style="width:${adrTeam1}%; height:100%; background:white; opacity:0.8;"></div>
                    </div>
                </div>
            </div>

            <!-- Bouton Twitch -->
            <button style="width:100%; margin-top:20px; padding:18px; background:#9146ff; color:white; border:none; border-radius:12px; font-weight:bold; font-family:'Orbitron'; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;">
                <span>🎬</span> VOIR LE LIVE TWITCH
            </button>
        </div>
    `;

    view.style.display = 'block';
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

// Lancement automatique
window.onload = () => {
    console.log("App lancée");
    navigateTo('matches');
};
