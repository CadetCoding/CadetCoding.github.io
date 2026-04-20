// 🚀 CADETCODE ENGINE - The Brain of the Mission
let pyodideInstance = null;
let errorCount = 0;

/**
 * 1. INITIALIZE PYTHON
 */
async function bootPython() {
    const telemetry = document.getElementById('telemetry-output');
    if(!telemetry) return;
    
    telemetry.innerHTML = "<span class='blink'>🛰️</span> INITIALIZING MISSION CONTROL...";

    try {
        pyodideInstance = await loadPyodide();
        telemetry.innerText = "✅ SYSTEMS ONLINE. READY FOR COMMANDS.";
    } catch (err) {
        telemetry.innerText = "❌ CRITICAL ERROR: FAILED TO BOOT PYTHON.";
    }
}

/**
 * 2. UNIVERSAL RUNNER
 * No parameters needed! It pulls "expected" data from the HTML body.
 */
async function runMissionCode() {
    const inputArea = document.getElementById('code-input');
    const telemetry = document.getElementById('telemetry-output');
    
    // Get the requirement from the body tag (data-expected="Hello Mars")
    const expectedOutput = document.body.dataset.expected;
    const code = inputArea.value;
    
    if (!pyodideInstance) {
        telemetry.innerText = "⏳ STILL BOOTING... PLEASE WAIT.";
        return;
    }

    try {
        // Redirect stdout to capture prints
        pyodideInstance.runPython(`
            import sys, io
            sys.stdout = io.StringIO()
        `);

        // Execute Cadet Code
        await pyodideInstance.runPythonAsync(code);

        // Get the output and clean it up
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()").trim();
        
        // --- VISUALIZER LOGIC (Fuel Jars, etc.) ---
        let visualData = "";
        if (code.includes("fuel")) {
            try {
                let fuelVal = pyodideInstance.globals.get('fuel');
                let bar = "█".repeat(Math.min(10, Math.max(0, fuelVal/10)));
                let empty = "░".repeat(Math.max(0, 10 - bar.length));
                visualData = `\n[FUEL LEVEL: ${bar}${empty}] ${fuelVal}%`;
            } catch(e) {}
        }

        // Show the output (Sandbox Mode: any code works and shows results here!)
        telemetry.innerText = (stdout || "🚀 COMMAND EXECUTED") + visualData;

        // --- SUCCESS CHECK ---
        // Only triggers if they match the hidden mission requirement
        if (expectedOutput && stdout === expectedOutput.trim()) {
            errorCount = 0;
            triggerSuccess();
        }

    } catch (err) {
        errorCount++;
        handleMissionErrors(err, telemetry);
    }
}

/**
 * 3. ERROR TRANSLATOR
 */
function handleMissionErrors(err, telemetry) {
    let errorMsg = err.message;
    let hint = (errorCount >= 3) ? "\n\n💡 HINT: Check your quotes \" \" and parentheses ( )!" : "";

    if (errorMsg.includes("SyntaxError")) {
        telemetry.innerText = "⚠️ GLITCH: Syntax Error! Check your 'Quotes'." + hint;
    } else if (errorMsg.includes("NameError")) {
        telemetry.innerText = "⚠️ SENSOR UNKNOWN: Did you misspell something?" + hint;
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
    if(ghost) ghost.style.opacity = input.value.length > 0 ? "0" : "1";
}

/**
 * 5. SUCCESS LOGIC
 */
function triggerSuccess() {
    const nextBtn = document.getElementById('next-btn');
    const telemetry = document.getElementById('telemetry-output');
    
    if (!telemetry.innerHTML.includes("⭐")) {
        telemetry.innerHTML += "\n\n⭐ MISSION ACCOMPLISHED! NEXT MODULE UNLOCKED.";
        if(nextBtn) nextBtn.style.display = "block";
        
        const currentLvl = parseInt(document.body.dataset.level);
        if (typeof missionData !== 'undefined') {
            if(!missionData.completedLevels.includes(currentLvl)) {
                missionData.completedLevels.push(currentLvl);
            }
            missionData.currentLevel = currentLvl + 1;
            saveProgress(); 
        }
    }
}

/**
 * 6. HELPER: COPY BLUEPRINT
 */
function copyBlueprint(text) {
    const input = document.getElementById('code-input');
    if(input) {
        input.value = text;
        handleGhostCode();
        document.getElementById('telemetry-output').innerText = "📋 BLUEPRINT LOADED. PRESS RUN!";
    }
}

bootPython();
