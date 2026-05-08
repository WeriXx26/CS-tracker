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
    
    if (!view) return;

    // On remplit la fenêtre noire avec du contenu visible
    view.innerHTML = `
        <div style="padding:25px; color:white; font-family:'Inter', sans-serif;">
            <!-- Bouton Retour bien visible -->
            <button onclick="closeDetail()" style="background:var(--accent); color:black; border:none; padding:12px 20px; border-radius:8px; font-weight:bold; cursor:pointer; font-family:'Orbitron';">
                ← RETOUR
            </button>

            <div style="margin-top:40px; text-align:center;">
                <h2 style="font-family:'Orbitron'; color:var(--accent); letter-spacing:2px;">
                    ${m.team1} vs ${m.team2}
                </h2>
                <p style="color:var(--gray); margin-bottom:30px;">Match ID: #${id}</p>
                
                <!-- Simulation de Stats -->
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:0.8rem; color:var(--accent); margin-bottom:15px;">PROBABILITÉS DE VICTOIRE</h3>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.7rem;">
                        <span>${m.team1}</span>
                        <span>50%</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); height:10px; border-radius:5px; overflow:hidden;">
                        <div style="background:var(--accent); width:50%; height:100%;"></div>
                    </div>
                </div>

                <button style="width:100%; margin-top:40px; padding:20px; background:#9146ff; color:white; border:none; border-radius:15px; font-weight:bold; font-family:'Orbitron'; shadow: 0 10px 20px rgba(0,0,0,0.5);">
                    REGARDER LE LIVE
                </button>
            </div>
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
