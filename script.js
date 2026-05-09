/**
 * 1. DONNÉES
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" }
];

/**
 * 2. NAVIGATION (La clé pour l'onglet Actus)
 */
function navigateTo(page) {
    console.log("Navigation demandée vers :", page);
    
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    
    if (!container) return;

    // Gestion visuelle des onglets actifs
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const currentNav = document.getElementById('nav-' + page);
    if (currentNav) currentNav.classList.add('active');

    // Nettoyage de la zone d'affichage
    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        renderList(matches);
    } 
    else if (page === 'news') {
        subTabs.style.display = 'none';
        renderNews(container);
    } 
    else if (page === 'settings') {
        subTabs.style.display = 'none';
        container.innerHTML = `
            <div style="text-align:center; padding:50px; animation: fadeIn 0.5s;">
                <h2 style="font-family:Orbitron; color:var(--accent);">PROFIL</h2>
                <p style="color:gray; font-size:0.8rem;">Paramètres du compte bientôt disponibles.</p>
            </div>`;
    }
}

/**
 * 3. SYSTÈME DE NEWS
 */
function renderNews(container) {
    console.log("Injection des news...");
    const articles = [
        {
            title: "MAJ : Train fait son retour ?",
            desc: "Les rumeurs s'intensifient autour de la prochaine mise à jour majeure de Valve.",
            img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg"
        },
        {
            title: "Vitality écrase la scène",
            desc: "ZywOo une nouvelle fois élu MVP après une performance historique.",
            img: "https://img.vavel.com/b/Vitality_CS2.jpg"
        }
    ];

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease-out;">
            <h2 style="font-family:Orbitron; font-size:0.9rem; margin-bottom:20px; text-align:center; color:var(--accent);">DERNIÈRES ACTUS</h2>
            ${articles.map(art => `
                <div class="news-card">
                    <img src="${art.img}" onerror="this.src='https://via.placeholder.com/400x200?text=CS2+News'">
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
 * 4. GESTION DES MATCHS
 */
function renderList(list) {
    const container = document.getElementById('match-list');
    list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.onclick = () => openMatchDetail(m.id);
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
                <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div>${m.team1}</div></div>
                <div style="text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:var(--accent);">${m.score}</div><div style="font-size:0.5rem; color:gray;">${m.status}</div></div>
                <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div>${m.team2}</div></div>
            </div>`;
        container.appendChild(card);
    });
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    // On pourra ajouter les favoris ici plus tard
    
    const container = document.getElementById('match-list');
    container.innerHTML = "";
    renderList(filtered);
}

/**
 * 5. VUE DÉTAILLÉE
 */
function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    if (!m || !view) return;

    view.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); color:white; z-index:10000; padding:20px; overflow-y:auto;">
            <button onclick="closeDetail()" style="background:var(--accent); color:black; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">← RETOUR</button>
            <div style="text-align:center; margin-top:30px;">
                <h2 style="font-family:Orbitron; color:var(--accent);">${m.team1} vs ${m.team2}</h2>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:15px; margin-top:20px;">
                    <p style="font-size:0.8rem; color:gray;">STATS EN DIRECT</p>
                    <div style="font-size:2rem; font-weight:bold; margin:10px 0;">${m.score}</div>
                </div>
                <button style="width:100%; margin-top:30px; padding:20px; background:#9146ff; color:white; border:none; border-radius:12px; font-weight:bold; font-family:Orbitron;">TWITCH LIVE</button>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

// Lancement automatique
window.onload = () => navigateTo('matches');
