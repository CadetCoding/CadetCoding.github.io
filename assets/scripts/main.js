// Mission Data Management
const CADET_KEY = "CADET_MISSION_LOG";

let missionData = {
    currentLevel: 1,
    completedLevels: [],
    lastAccessed: "level01_print.html"
};

// Initial Load
window.onload = function() {
    loadProgress();
    updateDashboard();
};

function loadProgress() {
    const saved = localStorage.getItem(CADET_KEY);
    if (saved) {
        missionData = JSON.parse(saved);
        document.getElementById('last-saved-text').innerText = 
            `RECOVERY FOUND: Last active at Level ${missionData.currentLevel}`;
    }
}

function updateDashboard() {
    // Loop through levels and unlock them
    for (let i = 1; i <= 4; i++) {
        let module = document.querySelector(`[data-lvl="${i}"]`);
        let statusSpan = document.getElementById(`s${i}`);
        
        if (missionData.completedLevels.includes(i)) {
            if (statusSpan) statusSpan.innerText = "[COMPLETED]";
            // Unlock next level if previous is done
            let nextMod = document.querySelector(`[data-lvl="${i+1}"]`);
            if (nextMod) {
                nextMod.classList.remove('locked');
                let nextStatus = nextMod.querySelector('.status-box');
                if(nextStatus.innerText.includes('LOCKED')) nextStatus.innerText = "Status: [READY]";
            }
        }
    }
}

// Navigation Logic
document.getElementById('continue-mission').onclick = function() {
    window.location.href = missionData.lastAccessed;
};

function navigateToLevel(lvlNum) {
    let mod = document.querySelector(`[data-lvl="${lvlNum}"]`);
    if (!mod.classList.contains('locked')) {
        let fileName = `level${lvlNum.toString().padStart(2, '0')}.html`;
        window.location.href = fileName;
    } else {
        alert("🔒 MODULE LOCKED: Complete previous missions first!");
    }
}

function resetProgress() {
    if (confirm("🚨 WARNING: Wiping data will delete all NASA badges and progress! Proceed?")) {
        localStorage.removeItem(CADET_KEY);
        location.reload();
    }
}
