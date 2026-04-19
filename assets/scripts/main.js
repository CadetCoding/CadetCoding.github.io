// 🛰️ MISSION DATA MANAGEMENT
const CADET_KEY = "CADET_MISSION_LOG";

let missionData = {
    currentLevel: 1,
    completedLevels: [],
    // Default starting point in the new folder structure
    lastAccessed: "lessons/python/text/level01.html"
};

// Initial Load when the page opens
window.onload = function() {
    loadProgress();
    // Only update the dashboard if we are on the index.html page
    if (document.getElementById('module-grid')) {
        updateDashboard();
    }
};

/**
 * 1. LOAD PROGRESS
 * Grabs the JSON string from the browser and turns it back into a JS Object.
 */
function loadProgress() {
    const saved = localStorage.getItem(CADET_KEY);
    if (saved) {
        missionData = JSON.parse(saved);
        const lastSavedText = document.getElementById('last-saved-text');
        if (lastSavedText) {
            lastSavedText.innerText = `RECOVERY FOUND: Last active at Level ${missionData.currentLevel}`;
        }
    }
}

/**
 * 2. SAVE PROGRESS
 * This is called by engine.js whenever a mission is completed.
 */
function saveProgress() {
    // Save the current page as the lastAccessed point
    missionData.lastAccessed = window.location.pathname;
    localStorage.setItem(CADET_KEY, JSON.stringify(missionData));
    console.log("💾 Mission Log Updated: Level " + missionData.currentLevel);
}

/**
 * 3. UPDATE DASHBOARD
 * Unlocks the buttons on the main index.html page.
 */
function updateDashboard() {
    for (let i = 1; i <= 100; i++) { // Supports up to 100 levels
        let module = document.querySelector(`[data-lvl="${i}"]`);
        let statusSpan = document.getElementById(`s${i}`);
        
        if (!module) break; // Stop if we ran out of level boxes

        if (missionData.completedLevels.includes(i)) {
            if (statusSpan) statusSpan.innerText = "[COMPLETED]";
            
            // Unlock the VERY next level
            let nextMod = document.querySelector(`[data-lvl="${i+1}"]`);
            if (nextMod) {
                nextMod.classList.remove('locked');
                let nextStatus = nextMod.querySelector('.status-box');
                if(nextStatus && nextStatus.innerText.includes('LOCKED')) {
                    nextStatus.innerText = "Status: [READY]";
                }
            }
        }
    }
}

/**
 * 4. NAVIGATION LOGIC
 * Handles the folder paths: /text/, /math/, /variables/
 */
function getLevelPath(lvlNum) {
    let sector = "text/"; // Default
    if (lvlNum > 2) sector = "math/";
    if (lvlNum > 5) sector = "variables/";
    // Add more sectors here as you grow (e.g., if lvlNum > 10 sector = "loops/")

    let fileName = `level${lvlNum.toString().padStart(2, '0')}.html`;
    
    // Check if we are currently in a subfolder or at the root
    let prefix = window.location.pathname.includes('lessons') ? "" : "lessons/python/";
    
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
    
    // If it's level 1 or unlocked, let them in
    if (lvlNum === 1 || (mod && !mod.classList.contains('locked'))) {
        window.location.href = getLevelPath(lvlNum);
    } else {
        alert("🔒 MODULE LOCKED: You haven't finished the previous mission yet, Cadet!");
    }
}

/**
 * 5. RESET DATA
 */
function resetProgress() {
    if (confirm("🚨 WARNING: This will permanently wipe your NASA badges and mission history!")) {
        localStorage.removeItem(CADET_KEY);
        location.reload();
    }
}
