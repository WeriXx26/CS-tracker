/**
 * 1. DONNÉES DE SIMULATION
 */
const matches = [
    { id: 1, team1: "Vitality", logo1: "https://i.ibb.co/f4pC6qF/vitality.png", team2: "G2", logo2: "https://i.ibb.co/L5T4FqC/g2.png", league: "PGL MAJOR", status: "LIVE", score: "1 - 0", startTime: new Date().getTime() },
    { id: 2, team1: "FaZe", logo1: "https://i.ibb.co/JqjXkM6/faze.png", team2: "NaVi", logo2: "https://i.ibb.co/BccC4W8/navi.png", league: "IEM KATOWICE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 3600000 },
    { id: 3, team1: "MOUZ", logo1: "https://i.ibb.co/9vK7hM0/wildcard.png", team2: "Furia", logo2: "https://i.ibb.co/P4zH5Vj/nouns.png", league: "ESL PRO LEAGUE", status: "UPCOMING", score: "0 - 0", startTime: new Date().getTime() + 7200000 }
];

let favorites = JSON.parse(localStorage.getItem('cs2_favs')) || [];
let currentPage = 'matches';

/**
 * 2. NAVIGATION ET FILTRES
 */
function navigateTo(page) {
    currentPage = page;
    const container = document.getElementById('match-list');
    const tabs = document.querySelector('.tabs');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');
    closeDetail();

    if (page === 'matches') {
        tabs.style.display = 'flex';
        const activeTab = document.querySelector('.tab.active') || document.querySelector('.tab');
        filterMatches(activeTab.innerText, activeTab);
    } 
    else if (page === 'news') {
        tabs.style.display = 'none';
        container.innerHTML = `
            <div style="animation: fadeIn 0.5s ease-out;">
                <h2 style="font-family:Orbitron; font-size:1rem; margin-bottom:20px; color:var(--accent);">BREVIÈVES CS2</h2>
                <div class="news-card" style="margin-bottom:25px; background:var(--card); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                    <img src="https://news.esea.net/content/images/2023/09/CS2_1.jpg" style="width:100%; height:150px; object-fit:cover;">
                    <div style="padding:15px;">
                        <h3 style="font-size:0.95rem; margin:0 0 8px 0;">MAJ : Le retour de Train sur CS2 ?</h3>
                        <p style="font-size:0.75rem; color:var(--gray); line-height:1.4;">Des fichiers trouvés dans la dernière mise à jour laissent planer le doute sur le retour d'une map iconique...</p>
                    </div>
                </div>
                <div class="news-card" style="margin-bottom:25px; background:var(--card); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                    <img src="https://img.vavel.com/b/Vitality_CS2.jpg" style="width:100%; height:150px; object-fit:cover;">
                    <div style="padding:15px;">
                        <h3 style="font-size:0.95rem; margin:0 0 8px 0;">Vitality reprend la place de n°1</h3>
                        <p style="font-size:0.75rem; color:var(--gray); line-height:1.4;">Après une performance historique, les abeilles dominent à nouveau le classement mondial HLTV.</p>
                    </div>
                </div>
            </div>`;
    } 
    else if (page === 'settings') {
        tabs.style.display = 'none';
        container.innerHTML = `
            <div style="padding:20px; text-align:center; animation: fadeIn 0.5s ease-out;">
                <h2 style="font-family:Orbitron; color:var(--accent);">MON PROFIL</h2>
                <div style="background:var(--card); padding:30px 20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); margin-top:20px;">
                    <div style="font-size:3rem; margin-bottom:10px;">👤</div>
                    <p style="font-weight:600; margin-bottom:5px;">Utilisateur Pro</p>
                    <p style="color:var(--gray); font-size:0.8rem; margin-bottom:20px;">⭐ ${favorites.length} équipes favorites</p>
                    <button onclick="clearData()" style="background:rgba(255,68,68,0.1); border:1px solid #ff4444; color:#ff4444; padding:12px 20px; border-radius:12px; cursor:pointer; font-weight:700; width:100%;">RÉINITIALISER L'APP</button>
                </div>
            </div>`;
    }
}

function filterMatches(type, element) {
    // UI: Onglets
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    const container = document.getElementById('match-list');
    
    // ÉTAPE PRO : Affichage du Skeleton (faux chargement)
    container.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
    `;

    // Simulation d'une latence réseau (500ms) pour faire "pro"
    setTimeout(() => {
        let filtered = matches;
        if (type === 'EN DIRECT' || type === 'LIVE') filtered = matches.filter(m => m.status === 'LIVE');
        if (type === 'FAVORIS' || type === 'FAV') filtered = matches.filter(m => favorites.includes(m.team1) || favorites.includes(m.team2));
        renderList(filtered, type);
    }, 500);
}

/**
 * 3. LOGIQUE D'AFFICHAGE
 */
function renderList(list, type) {
    const container = document.getElementById('match-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; margin-top:100px; color:var(--gray); animation: fadeIn 0.5s;">
            <p style="font-size:1.2rem;">Empty Loadout 🛡️</p>
            <p style="font-size:0.8rem;">Aucun match trouvé dans cette catégorie.</p>
        </div>`;
        return;
    }

    list.forEach(m => {
        const isFav1 = favorites.includes(m.team1) ? '⭐' : '☆';
        const isFav2 = favorites.includes(m.team2) ? '⭐' : '☆';
        const timeDisplay = m.status === 'LIVE' ? '● LIVE' : getCountdown(m.startTime);

        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail(${m.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="team" onclick="toggleFavorite('${m.team1}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo1}" style="width:45px; height:45px; object-fit:contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
                        <div style="font-size:0.75rem; margin-top:10px; font-weight:600;">${isFav1} ${m.team1}</div>
                    </div>
                    
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.4rem; font-weight:800; color:var(--accent); letter-spacing:2px;">${m.score}</div>
                        <div style="font-size:0.65rem; background:rgba(255,255,255,0.05); padding:4px 12px; border-radius:6px; margin-top:10px; display:inline-block; font-weight:700; color:${m.status === 'LIVE' ? 'var(--live)' : 'white'}; border:1px solid rgba(255,255,255,0.1);">
                            ${timeDisplay}
                        </div>
                    </div>

                    <div class="team" onclick="toggleFavorite('${m.team2}', event)" style="width:30%; text-align:center;">
                        <img src="${m.logo2}" style="width:45px; height:45px; object-fit:contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
                        <div style="font-size:0.75rem; margin-top:10px; font-weight:600;">${m.team2} ${isFav2}</div>
                    </div>
                </div>
            </div>`;
    });
}

/**
 * 4. UTILITAIRES ET DÉTAILS
 */
function getCountdown(startTime) {
    const diff = startTime - new Date().getTime();
    if (diff <= 0) return "EN DIRECT";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `Dans ${h}h ${m}m` : `Dans ${m} min`;
}

function openMatchDetail(id) {
    const m = matches.find(match => match.id === id);
    const view = document.getElementById('match-detail');
    view.innerHTML = `
        <div style="padding:25px; height:100%; display:flex; flex-direction:column; background: linear-gradient(to bottom, #1a1f26, #0b0d10);">
            <button onclick="closeDetail()" style="background:none; border:none; color:var(--accent); font-weight:800; padding:15px 0; font-family:Orbitron; cursor:pointer;">← RETOUR</button>
            
            <div class="match-card" style="margin-top:20px; text-align:center; padding:40px 20px; background:rgba(255,255,255,0.03);">
                <p style="color:var(--accent); font-size:0.7rem; letter-spacing:2px; font-weight:700; margin-bottom:20px;">${m.league}</p>
                <div style="display:flex; justify-content:center; align-items:center; gap:25px;">
                    <div><img src="${m.logo1}" width="70"><h3>${m.team1}</h3></div>
                    <div style="font-size:1.5rem; font-weight:900; opacity:0.2;">VS</div>
                    <div><img src="${m.logo2}" width="70"><h3>${m.team2}</h3></div>
                </div>
                <div style="margin-top:30px; border-top:1px solid rgba(255,255,255,0.05); padding-top:20px;">
                    <div style="display:flex; justify-content:space-around; font-size:0.8rem; color:var(--gray);">
                        <div>FORMAT: BO3</div>
                        <div>MAP: DUST II</div>
                    </div>
                </div>
                <button style="background:#9146ff; color:white; border:none; padding:18px; border-radius:14px; width:100%; margin-top:40px; font-weight:800; font-size:0.9rem; box-shadow: 0 10px 20px rgba(145, 70, 255, 0.3);">REGARDER SUR TWITCH</button>
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

function clearData() {
    if(confirm("Supprimer toutes les données locales ?")) {
        localStorage.clear();
        location.reload();
    }
}

// Initialisation
window.onload = () => navigateTo('matches');

// Auto-refresh léger (toutes les minutes)
setInterval(() => {
    if(currentPage === 'matches' && document.getElementById('match-detail').style.display !== 'block') {
        const activeTab = document.querySelector('.tab.active');
        filterMatches(activeTab.innerText, activeTab);
    }
}, 60000);
