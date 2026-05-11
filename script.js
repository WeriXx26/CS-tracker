const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div style="text-align:center;padding:20px;">Connexion au serveur...</div>`;
    
    try {
        const res = await fetch(`${API_URL}/matches`);
        const data = await res.json();
        console.log("Données reçues :", data);

        if (!data || data.length === 0) {
            container.innerHTML = "Aucun match trouvé sur le serveur.";
            return;
        }

        container.innerHTML = data.map(m => `
            <div class="match-card" style="background:#111; border:1px solid #333; margin-bottom:10px; padding:15px; border-radius:10px;">
                <div style="display:flex; justify-content:space-between; font-size:0.6rem; color:#ffb400; margin-bottom:10px;">
                    <span>${m.status}</span>
                    <span>${m.event}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:35%; text-align:center; font-weight:bold;">${m.team1}</div>
                    <div style="font-size:1.5rem; font-weight:900;">${m.score1} - ${m.score2}</div>
                    <div style="width:35%; text-align:center; font-weight:bold;">${m.team2}</div>
                </div>
                <div style="text-align:center; font-size:0.5rem; color:#444; margin-top:10px;">SOURCE: ${m.source}</div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = "Erreur : Impossible de contacter le serveur Railway.";
        console.error(e);
    }
}

function navigateTo(page) {
    if (page === 'matches') {
        fetchAndRenderMatches();
    } else {
        document.getElementById('match-list').innerHTML = `<div style="text-align:center;padding:50px;">PAGE ${page.toUpperCase()}</div>`;
    }
}

window.onload = () => navigateTo('matches');
