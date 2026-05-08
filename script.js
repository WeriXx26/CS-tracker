const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';

function navigateTo(page) {
    document.getElementById('match-detail').style.display = 'none';
    currentPage = page;

    // UI Onglets hauts
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');

    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        filterMatches('TOUS', document.querySelector('.tab'));
    } else {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Contenu ${page} à venir...</div>`;
    }
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    let filtered = matches;
    if (type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    if (type === 'FAVORIS' || type === 'FAV') filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));

    renderList(filtered);
}

function renderList(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';
    list.forEach(m => {
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:30%; text-align:center;"><img src="${m.logo1}" width="35"><div style="font-size:0.7rem;">${m.team1}</div></div>
                    <div style="text-align:center;"><div style="font-size:1.2rem; font-weight:700; color:var(--accent);">${m.score}</div></div>
                    <div style="width:30%; text-align:center;"><img src="${m.logo2}" width="35"><div style="font-size:0.7rem;">${m.team2}</div></div>
                </div>
            </div>`;
    });
}

function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    view.innerHTML = `
        <div style="padding:20px; background:#0b0d10; height:100vh;">
            <button onclick="closeDetail()" style="background:var(--accent); color:black; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; margin-bottom:20px; cursor:pointer;">← RETOUR</button>
            <div class="match-card" style="text-align:center;">
                <h2 style="font-family:Orbitron; color:var(--accent);">${m.team1} vs ${m.team2}</h2>
                <p>Stats détaillées ici...</p>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { document.getElementById('match-detail').style.display = 'none'; }

window.onload = () => navigateTo('matches');
