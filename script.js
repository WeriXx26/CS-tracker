/**
 * 1. CONFIGURATION
 * Remplace 'TON_TOKEN' par ta clé PandaScore
 */
const PANDA_TOKEN = 'GOA-V3x_Qi2zV7-bZhurTmpB78ZojtXQDLpG23ApSgj8dSFzfRQ'; 
const PROXY = 'https://corsproxy.io/?'; // Proxy gratuit pour débloquer la connexion
const API_URL = 'https://api.pandascore.co/csgo/matches?sort=status&per_page=15';

/**
 * 2. NAVIGATION
 */
function navigateTo(page) {
    const container = document.getElementById('match-list');
    const subTabs = document.getElementById('sub-tabs');
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + page);
    if (activeNav) activeNav.classList.add('active');

    container.innerHTML = "";
    if (page === 'matches') {
        subTabs.style.display = 'flex';
        fetchLiveMatches();
    } else {
        subTabs.style.display = 'none';
        container.innerHTML = `<div style="text-align:center;padding:50px;color:gray;font-family:Orbitron;font-size:0.7rem;">SECTION ${page.toUpperCase()}</div>`;
    }
}

/**
 * 3. APPEL API AVEC CORRECTIF DE CONNEXION
 */
async function fetchLiveMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--accent); font-family:Orbitron; font-size:0.6rem; letter-spacing:2px;">RÉCUPÉRATION DES DONNÉES SÉCURISÉES...</div>`;

    try {
        // On combine le Proxy + l'URL PandaScore + le Token
        const response = await fetch(PROXY + encodeURIComponent(`${API_URL}&token=${PANDA_TOKEN}`));
        
        if (!response.ok) throw new Error('Erreur Serveur');
        
        const data = await response.json();

        if (data && data.length > 0) {
            renderMatches(data);
        } else {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:gray;">Aucun match pro en ce moment.</div>`;
        }
    } catch (error) {
        console.error("Erreur:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <p style="color:#ff4444; font-size:0.8rem;">ERREUR DE FLUX API</p>
                <p style="color:gray; font-size:0.6rem; margin-top:10px;">Vérifie ton Token PandaScore ou le réseau.</p>
                <button onclick="fetchLiveMatches()" style="margin-top:20px; background:var(--accent); border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">RÉESSAYER</button>
            </div>`;
    }
}

/**
 * 4. RENDU DES MATCHS RÉELS
 */
function renderMatches(list) {
    const container = document.getElementById('match-list');
    container.innerHTML = "";

    list.forEach(m => {
        // Extraction sécurisée des noms et logos
        const t1 = m.opponents[0]?.opponent || { name: "TBD", image_url: "" };
        const t2 = m.opponents[1]?.opponent || { name: "TBD", image_url: "" };
        const score1 = m.results[0]?.score || 0;
        const score2 = m.results[1]?.score || 0;
        const isLive = m.status === "running";

        container.innerHTML += `
            <div class="match-card" style="border-left: 3px solid ${isLive ? '#ff4444' : 'transparent'}; animation: fadeIn 0.4s;">
                <div style="font-size:0.5rem; color:var(--gray); margin-bottom:10px; display:flex; justify-content:space-between;">
                    <span>${m.league.name}</span>
                    <span style="color:var(--accent);">${isLive ? '● LIVE' : 'UPCOMING'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:35%; text-align:center;">
                        <img src="${t1.image_url || 'https://via.placeholder.com/40/222/white?text=?'}" width="35" style="height:35px; object-fit:contain;">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t1.name}</div>
                    </div>
                    
                    <div style="text-align:center; flex:1;">
                        <div style="font-size:1.5rem; font-weight:900; letter-spacing:-1px; color:${isLive ? '#fff' : 'var(--accent)'};">
                            ${score1} - ${score2}
                        </div>
                    </div>

                    <div style="width:35%; text-align:center;">
                        <img src="${t2.image_url || 'https://via.placeholder.com/40/222/white?text=?'}" width="35" style="height:35px; object-fit:contain;">
                        <div style="font-size:0.65rem; font-weight:bold; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t2.name}</div>
                    </div>
                </div>
            </div>`;
    });
}

function closeDetail() {
    const view = document.getElementById('match-detail');
    if (view) view.style.display = 'none';
}

window.onload = () => navigateTo('matches');
