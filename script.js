const API_URL = 'https://server-production-9224.up.railway.app';
const DEFAULT_LOGO = 'https://raw.githubusercontent.com/werixx26/werixx26.github.io/main/cs2-logo.png';

async function fetchAndRenderMatches() {
    const container = document.getElementById('match-list');
    container.innerHTML = `<div class="loader">CHARGEMENT VIA PROXY...</div>`;
    
    try {
        const res = await fetch(`${API_URL}/matches`);
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;">HLTV est trop protégé ou quota ScraperAPI dépassé.</div>`;
            return;
        }

        container.innerHTML = data.map(m => `
            <div class="match-card">
                <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:#888;margin-bottom:8px;">
                    <span>${m.isLive ? '<b style="color:red;">● LIVE</b>' : m.status}</span>
                    <span style="max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.event}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:35%;text-align:center;">
                        <img src="${m.logo1 || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:4px;">${m.team1}</div>
                    </div>
                    <div style="font-size:1.4rem;font-weight:900;">${m.score1} - ${m.score2}</div>
                    <div style="width:35%;text-align:center;">
                        <img src="${m.logo2 || DEFAULT_LOGO}" width="30" onerror="this.src='${DEFAULT_LOGO}'">
                        <div style="font-size:0.7rem;font-weight:bold;margin-top:4px;">${m.team2}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:20px;">Erreur de connexion serveur.</div>`;
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
