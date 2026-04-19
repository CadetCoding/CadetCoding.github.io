// 🚀 CADETCODE ENGINE - The Brain of the Mission
let pyodideInstance = null;
let errorCount = 0; // Tracks mistakes for the Hint System

/**
 * 1. INITIALIZE PYTHON
 */
async function bootPython() {
    const telemetry = document.getElementById('telemetry-output');
    if(!telemetry) return;
    
    telemetry.innerHTML = "<span class='blink'>🛰️</span> INITIALIZING MISSION CONTROL...";

    try {
        // Load Pyodide (Using CDN for stability, point to /.libraries/ for offline)
        pyodideInstance = await loadPyodide();
        telemetry.innerText = "✅ SYSTEMS ONLINE. READY FOR COMMANDS.";
    } catch (err) {
        telemetry.innerText = "❌ CRITICAL ERROR: FAILED TO BOOT PYTHON.";
        console.error(err);
    }
}

/**
 * 2. RUN CADET CODE
 */
async function runMissionCode(expectedOutput = null) {
    const code = document.getElementById('code-input').value;
    const telemetry = document.getElementById('telemetry-output');
    
    if (!pyodideInstance) {
        telemetry.innerText = "⏳ STILL BOOTING... PLEASE WAIT.";
        return;
    }

    try {
        // Capture Python Output
        pyodideInstance.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
        `);

        // Execute Code
        await pyodideInstance.runPythonAsync(code);

        // Get Output
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
        
        // --- VISUALIZER LOGIC ---
        // If they created a variable called 'fuel', show a progress bar
        let visualData = "";
        if (code.includes("fuel")) {
            try {
                let fuelVal = pyodideInstance.globals.get('fuel');
                visualData = `\n[FUEL LEVEL: ${"█".repeat(fuelVal/10)}${"░".repeat(10-(fuelVal/10))}] ${fuelVal}%`;
            } catch(e) {}
        }

        telemetry.innerText = (stdout || "🚀 COMMAND EXECUTED") + visualData;

        // Success Check
        if (expectedOutput && stdout.trim() === expectedOutput.trim()) {
            errorCount = 0;
            triggerSuccess();
        }

    } catch (err) {
        errorCount++;
        handleMissionErrors(err, telemetry);
    }
}

/**
 * 3. ERROR TRANSLATOR & HINT SYSTEM
 */
function handleMissionErrors(err, telemetry) {
    let errorMsg = err.message;
    let hint = "";

    if (errorCount >= 3) {
        hint = "\n\n💡 MISSION CONTROL HINT: Remember the 'Quote Sandwich' rule. Check your starting and ending \" symbols!";
    }

    if (errorMsg.includes("SyntaxError")) {
        telemetry.innerText = "⚠️ GLITCH: Syntax Error! Check your 'Quotes' or 'Parentheses'." + hint;
    } else if (errorMsg.includes("NameError")) {
        telemetry.innerText = "⚠️ SENSOR UNKNOWN: Did you misspell a variable or command?" + hint;
    } else {
        telemetry.innerText = "⚠️ SYSTEM ERROR: " + errorMsg.split('at');
    }
}

/**
 * 4. GHOST CODE LOGIC
 */
function handleGhostCode() {
    const input = document.getElementById('code-input');
    const ghost = document.getElementById('ghost-code-layer');
    
    // Hide ghost text if user starts typing
    ghost.style.opacity = input.value.length > 0 ? "0" : "1";
}

/**
 * 5. SUCCESS LOGIC
 */
function triggerSuccess() {
    const nextBtn = document.getElementById('next-btn');
    const telemetry = document.getElementById('telemetry-output');
    
    telemetry.innerHTML += "\n\n⭐ MISSION ACCOMPLISHED! NEXT MODULE UNLOCKED.";
    if(nextBtn) nextBtn.style.display = "block";
    
    // Save Progress via main.js
    const currentLvl = parseInt(document.body.dataset.level);
    if (typeof missionData !== 'undefined') {
        if(!missionData.completedLevels.includes(currentLvl)) {
            missionData.completedLevels.push(currentLvl);
        }
        missionData.currentLevel = currentLvl + 1;
        saveProgress(); 
    }
}

// 6. HELPER: COPY BLUEPRINT
function copyBlueprint(text) {
    const input = document.getElementById('code-input');
    input.value = text;
    handleGhostCode();
    document.getElementById('telemetry-output').innerText = "📋 BLUEPRINT LOADED INTO CONSOLE.";
}

bootPython();
