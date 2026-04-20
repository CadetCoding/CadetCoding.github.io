// 🛰️ MISSION DATA MANAGEMENT
const CADET_KEY = "CADET_MISSION_LOG";

let missionData = {
    currentLevel: 1,
    completedLevels: [],
    lastAccessed: "lessons/python/text/level01.html"
};

window.onload = function() {
    loadProgress();
    updateDashboard();
};

function loadProgress() {
    const saved = localStorage.getItem(CADET_KEY);
    if (saved) {
        missionData = JSON.parse(saved);
        const lastSavedText = document.getElementById('last-saved-text');
        if (lastSavedText) {
            lastSavedText.innerText = `RECOVERY FOUND: Ready for Level ${missionData.currentLevel}`;
        }
    }
}

function saveProgress() {
    missionData.lastAccessed = window.location.pathname;
    localStorage.setItem(CADET_KEY, JSON.stringify(missionData));
}

function updateDashboard() {
    // Loop through all possible 8 levels
    for (let i = 1; i <= 8; i++) {
        let module = document.querySelector(`[data-lvl="${i}"]`);
        let statusSpan = document.getElementById(`s${i}`) || (module ? module.querySelector('.status-box') : null);
        
        if (!module) continue;

        if (missionData.completedLevels.includes(i)) {
            module.classList.remove('locked');
            module.classList.add('unlocked');
            if (statusSpan) statusSpan.innerText = "Status: [COMPLETED]";
            
            // Unlock next level
            let nextMod = document.querySelector(`[data-lvl="${i+1}"]`);
            if (nextMod) {
                nextMod.classList.remove('locked');
                let nextStatus = nextMod.querySelector('.status-box');
                if (nextStatus) nextStatus.innerText = "Status: [READY]";
            }
        }
    }
}

function getLevelPath(lvlNum) {
    let sector = "text/";
    // Match our specific level-to-folder logic
    if (lvlNum >= 4) sector = "math/";
    if (lvlNum >= 6) sector = "variables/";

    let fileName = `level${lvlNum.toString().padStart(2, '0')}.html`;
    
    // If we are on the dashboard (index.html), we need the full path
    // If we are already in a lesson, we need to go up folders (handled by the HTML buttons)
    let prefix = "lessons/python/";
    return `${prefix}${sector}${fileName}`;
}

const continueBtn = document.getElementById('continue-mission');
if (continueBtn) {
    continueBtn.onclick = function() {
        window.location.href = missionData.lastAccessed;
    };
}

function navigateToLevel(lvlNum) {
    let mod = document.querySelector(`[data-lvl="${lvlNum}"]`);
    if (lvlNum === 1 || (mod && !mod.classList.contains('locked'))) {
        window.location.href = getLevelPath(lvlNum);
    } else {
        alert("🔒 MISSION LOCKED: Complete the previous level first!");
    }
}

function resetProgress() {
    if (confirm("🚨 WIPE ALL DATA?")) {
        localStorage.removeItem(CADET_KEY);
        location.reload();
    }
}
