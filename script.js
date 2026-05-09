/**
 * 1. CONFIGURATION API
 * Remplace 'TA_CLE_PANDASCORE' par ton vrai token PandaScore
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; 
const matchesContainer = 'match-list';

/**
 * 2. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById(matchesContainer);
    const subTabs = document.getElementById('sub-tabs');
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    closeDetail();

    if (page === 'matches') {
        subTabs.style.display = 'flex';
        fetchLiveMatches(); // Appel API au chargement
    } else if (page === 'news') {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;">ONGLET NEWS (SIMULÉ)</div>`;
    }
}

/**
 * 3. APPEL API PANDASCORE (MATCHS RÉELS)
 */
async function fetchLiveMatches() {
    const container = document.getElementById(matchesContainer);
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; font-size:0.7rem;">CHARGEMENT DES MATCHS PROS...</div>`;

    try {
        // On récupère les matchs "running" (en cours) et "upcoming" (à venir)
        const response = await fetch(`https://api.pandascore.co/csgo/matches?token=${PANDA_TOKEN}&sort=status&per_page=10`);
        const data = await response.json();

        if (data.length > 0) {
            renderMatches(data);
        } else {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match pro aujourd'hui.</div>`;
        }
    } catch (error) {
        console.error("Erreur API:", error);
        container.innerHTML = `<div style="text-align:center; padding:50px; color:red;">Erreur de connexion à l'API PandaScore.</div>`;
    }
}

/**
 * 4. AFFICHAGE DES MATCHS
 */
function renderMatches(list) {
    const container = document.getElementById(matchesContainer);
    container.innerHTML = "";

    list.forEach(m => {
        const team1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/50" };
        const team2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "https://via.placeholder.com/50" };
        
        // Gestion du score en direct
        const score1 = m.results[0]?.score || 0;
        const score2 = m.results[1]?.score || 0;
        const isLive = m.status === "running";

        container.innerHTML += `
            <div class="match-card" onclick="openMatchDetail('${m.id}')" style="border-left: 4px solid ${isLive ? 'var(--live)' : 'transparent'};">
                <div style="font-size:0.5rem; color:var(--gray); margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">
                    ${m.league.name} - ${m.serie.full_name}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:35%; text-align:center;">
                        <img src="${team1.image_url || 'https://via.placeholder.com/50'}" width="35" style="filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">
                        <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${team1.name}</div>
                    </div>
                    
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.4rem; font-weight:900; color:${isLive ? 'var(--live)' : 'var(--accent)'};">
                            ${score1} - ${score2}
                        </div>
                        <div style="font-size:0.5rem; background:${isLive ? 'red' : '#333'}; color:white; display:inline-block; padding:2px 6px; border-radius:3px;">
                            ${isLive ? 'LIVE' : 'À VENIR'}
                        </div>
                    </div>

                    <div style="width:35%; text-align:center;">
                        <img src="${team2.image_url || 'https://via.placeholder.com/50'}" width="35" style="filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">
                        <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">${team2.name}</div>
                    </div>
                </div>
            </div>`;
    });
}

function openMatchDetail(id) {
    // On pourra enrichir cette partie avec les stats spécifiques du match via l'ID
    alert("Détails du match ID: " + id);
}

function closeDetail() {
    document.getElementById('match-detail').style.display = 'none';
}

window.onload = () => navigateTo('matches');
