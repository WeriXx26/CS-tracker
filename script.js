const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", status: "LIVE", score: "1 - 0" },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", status: "UPCOMING", score: "0 - 0" }
];

let favorites = [];

function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    if (!container) return;

    // UI Onglets hauts
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
        renderNews(container);
    } else {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;">PROFIL BIENTÔT DISPONIBLE</div>`;
    }
}

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

function renderNews(container) {
    const articles = [
        { title: "Retour de Train ?", desc: "Valve préparerait une surprise pour la saison prochaine.", img: "https://news.esea.net/content/images/2023/09/CS2_1.jpg" },
        { title: "ZywOo MVP", desc: "Vitality domine outrageusement le dernier tournoi.", img: "https://img.vavel.com/b/Vitality_CS2.jpg" }
    ];
    container.innerHTML = articles.map(art => `
        <div class="news-card" style="animation: fadeIn 0.4s;">
            <img src="${art.img}">
            <div class="news-content">
                <h3>${art.title}</h3>
                <p>${art.desc}</p>
            </div>
        </div>`).join('');
}

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

window.onload = () => navigateTo('matches');
