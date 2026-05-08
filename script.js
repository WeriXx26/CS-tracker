// DONNÉES
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 },
    { id: 3, team1: "MOUZ", logo1: "https://i.ibb.co/9vK7hM0/wildcard.png", team2: "Furia", logo2: "https://i.ibb.co/P4zH5Vj/nouns.png", league: "ESL PRO LEAGUE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 7200000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';

// NAVIGATION
function navigateTo(page) {
    currentPage = page;
    const container = document.getElementById('match-list');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');
    closeDetail();

    // ... dans navigateTo(page) ...
else if (page === 'news') {
    document.querySelector('.tabs').style.display = 'none';
    container.innerHTML = `
        <h2 style="font-family:Orbitron; font-size:1rem; margin-bottom:20px;">BREVIÈVES CS2</h2>
        <div class="news-card" style="margin-bottom:20px;">
            <img src="https://news.esea.net/content/images/2023/09/CS2_1.jpg" style="width:100%; border-radius:12px; margin-bottom:10px;">
            <h3 style="font-size:0.9rem; margin:5px 0;">MAJ : Le retour de Train sur CS2 ?</h3>
            <p style="font-size:0.7rem; color:var(--gray);">Des fichiers trouvés dans la dernière mise à jour laissent planer le doute...</p>
        </div>
        <div class="news-card" style="margin-bottom:20px;">
            <img src="https://img.vavel.com/b/Vitality_CS2.jpg" style="width:100%; border-radius:12px; margin-bottom:10px;">
            <h3 style="font-size:0.9rem; margin:5px 0;">Vitality reprend la place de n°1 mondial</h3>
            <p style="font-size:0.7rem; color:var(--gray);">Après leur victoire au dernier tournoi, les abeilles dominent le classement HLTV.</p>
        </div>
    `;
}
    } else {
        document.querySelector('.tabs').style.display = 'none';
        container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--gray)">Onglet ${page.toUpperCase()} en cours de développement...</div>`;
    }
}

function filterMatches(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    let filtered = matches;
    if (type === 'EN DIRECT' || type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
    if (type === 'FAVORIS' || type === 'FAV') filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));

    renderList(filtered, type);
}

// TEMPS RÉEL
function getCountdown(startTime) {
    const diff = startTime - new Date().getTime();
    if (diff <= 0) return "EN DIRECT";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `Dans ${h}h ${m}m` : `Dans ${m} min`;
}

// AFFICHAGE
function renderList(list, type) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; margin-top:100px; color:var(--gray)">Aucun match trouvé</div>`;
        return;
    }
    list.forEach(m => {
        const isFav1 = favorites.includes(m.team1) ? '⭐' : '☆';
        const isFav2 = favorites.includes(m.team2) ? '⭐' : '☆';
        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="team" onclick="toggleFavorite('${m.team1}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo1}" width="40" height="40">
                        <div style="font-size:0.7rem; margin-top:8px; font-weight:600;">${isFav1} ${m.team1}</div>
                    </div>
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.3rem; font-weight:700; color:var(--accent);">${m.score}</div>
                        <div style="font-size:0.6rem; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:6px; margin-top:8px; color:${m.status === 'LIVE' ? 'var(--live)' : 'white'}">
                            ${m.status === 'LIVE' ? '● LIVE' : getCountdown(m.startTime)}
                        </div>
                    </div>
                    <div class="team" onclick="toggleFavorite('${m.team2}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo2}" width="40" height="40">
                        <div style="font-size:0.7rem; margin-top:8px; font-weight:600;">${m.team2} ${isFav2}</div>
                    </div>
                </div>
            </div>`;
    });
}

function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    view.innerHTML = `
        <div style="padding:20px; height:100%; display:flex; flex-direction:column;">
            <button onclick="closeDetail()" style="background:none; border:none; color:var(--accent); font-weight:700; padding:10px 0; text-align:left; cursor:pointer;">← RETOUR</button>
            <div class="match-card" style="margin-top:20px; text-align:center; padding:40px 20px;">
                <h2 style="font-family:Orbitron; font-size:1.1rem; color:var(--accent);">${m.team1} vs ${m.team2}</h2>
                <p style="color:var(--gray); font-size:0.8rem;">${m.league}</p>
                <button style="background:#9146ff; color:white; border:none; padding:15px; border-radius:12px; width:100%; margin-top:30px; font-weight:700;">REGARDER SUR TWITCH</button>
            </div>
        </div>`;
    view.style.display = 'block';
}

function closeDetail() { document.getElementById('match-detail').style.display = 'none'; }

function toggleFavorite(team, e) {
    e.stopPropagation();
    favorites.includes(team) ? favorites = favorites.filter(f => f !== team) : favorites.push(team);
    localStorage.setItem('cs2_favs', JSON.stringify(favorites));
    const activeTab = document.querySelector('.tab.active');
    filterMatches(activeTab.innerText, activeTab);
}

window.onload = () => navigateTo('matches');
setInterval(() => { if(currentPage === 'matches') navigateTo('matches'); }, 60000);
