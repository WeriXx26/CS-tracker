const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">ACCÈS À HLTV EN COURS... (Patientez 20s)</div>`;
    
    try {
        // On ajoute un signal d'arrêt plus long (45 secondes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(`${API_URL}/matches`, { signal: controller.signal });
        const data = await res.json();
        clearTimeout(timeoutId);

        if (!data || data.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;">HLTV bloque encore l'accès ou aucun match.</div>`;
            return;
        }

        container.innerHTML = data.map(m => `
            <div class="match-card">
                <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:#888;margin-bottom:8px;">
                    <span>${m.isLive ? '<b style="color:red;">● LIVE</b>' : m.status}</span>
                    <span style="max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.event}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:35%;text-align:center;">
                        <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:4px;">${m.team1}</div>
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;">${m.score1} - ${m.score2}</div>
                    <div style="width:35%;text-align:center;">
                        <img src="${DEFAULT_LOGO}" width="25" style="opacity:0.5;">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:4px;">${m.team2}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Le serveur Railway met trop de temps à répondre. Réessayez.</div>`;
    }
}

function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if(document.getElementById('nav-' + page)) document.getElementById('nav-' + page).classList.add('active');
    
    if (page === 'matches') {
        fetchAndRenderMatches();
    } else {
        document.getElementById('match-list').innerHTML = `<div style="text-align:center;padding:50px;">ACTUS HLTV</div>`;
    }
}

window.onload = () => navigateTo('matches');
