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
    console.log("Tentative d'ouverture du match ID:", id); // Vérification console
    
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    
    if (!m || !view) {
        console.error("Match ou Vue introuvable !");
        return;
    }

    // On force l'affichage du contenu avec des styles ultra-visibles
    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#0b0d10; color:white; z-index:10000; padding:20px; overflow-y:auto; display:block;">
            <button onclick="closeDetail()" style="background:#ffb400; color:black; border:none; padding:15px 25px; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:30px;">
                ← RETOUR
            </button>

            <div style="text-align:center;">
                <h2 style="font-family:'Orbitron', sans-serif; font-size:1.5rem; color:#ffb400; margin-bottom:10px;">
                    ${m.team1} vs ${m.team2}
                </h2>
                <p style="color:#9ba1a6; margin-bottom:30px;">Match en cours</p>
                
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.1); margin-bottom:20px;">
                    <p style="font-size:0.9rem;">SCORE ACTUEL</p>
                    <p style="font-size:2.5rem; font-weight:bold; color:#ffb400;">${m.score || '0 - 0'}</p>
                </div>

                <div style="padding:20px; border:2px dashed #ffb400; border-radius:15px; color:#ffb400;">
                    ZONE DE STATISTIQUES ACTIVE
                </div>
            </div>
        </div>
    `;

    view.style.display = 'block';
    console.log("Vue détail affichée avec succès");
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
