// 🚀 CADETCODE ENGINE - The Brain of the Mission
let pyodideInstance = null;

/**
 * 1. INITIALIZE PYTHON
 * This loads the Pyodide engine from the /.libraries/ folder or CDN.
 */
async function bootPython() {
    const telemetry = document.getElementById('telemetry-output');
    telemetry.innerText = "🛰️ INITIALIZING MISSION CONTROL...";

    try {
        // Load Pyodide from the web (or your local .libraries/ folder)
        pyodideInstance = await loadPyodide();
        telemetry.innerText = "✅ SYSTEMS ONLINE. READY FOR COMMANDS.";
    } catch (err) {
        telemetry.innerText = "❌ CRITICAL ERROR: FAILED TO BOOT PYTHON.";
        console.error(err);
    }
}

/**
 * 2. RUN CADET CODE
 * Grabs text from the input, runs it, and checks for success.
 */
async function runMissionCode(expectedOutput = null) {
    const code = document.getElementById('code-input').value;
    const telemetry = document.getElementById('telemetry-output');
    
    if (!pyodideInstance) {
        telemetry.innerText = "⏳ STILL BOOTING... PLEASE WAIT.";
        return;
    }

    try {
        // Redirect Python's "print" to our telemetry box
        pyodideInstance.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
        `);

        // Execute the Cadet's Code
        await pyodideInstance.runPythonAsync(code);

        // Grab the result from stdout
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
        telemetry.innerText = stdout || "🚀 COMMAND EXECUTED (No output)";

        // Check if they passed the mission
        if (expectedOutput && stdout.trim() === expectedOutput) {
            triggerSuccess();
        }

    } catch (err) {
        // ERROR TRANSLATOR: Turn scary Python errors into NASA alerts
        let errorMsg = err.message;
        if (errorMsg.includes("SyntaxError")) {
            telemetry.innerText = "⚠️ GLITCH: Check your 'Quotes' or 'Parentheses'!";
        } else if (errorMsg.includes("NameError")) {
            telemetry.innerText = "⚠️ SENSOR UNKNOWN: Did you misspell a word?";
        } else {
            telemetry.innerText = "⚠️ SYSTEM ERROR: " + errorMsg;
        }
    }
}

/**
 * 3. GHOST CODE LOGIC
 * Makes the gray text stay behind the user's typing.
 */
function handleGhostCode() {
    const input = document.getElementById('code-input');
    const ghost = document.getElementById('ghost-code-layer');
    
    // If the cadet types, we hide the ghost text
    if (input.value.length > 0) {
        ghost.style.visibility = 'hidden';
    } else {
        ghost.style.visibility = 'visible';
    }
}

/**
 * 4. SUCCESS STATE
 * Unlocks the Next Button and updates LocalStorage.
 */
function triggerSuccess() {
    const nextBtn = document.getElementById('next-btn');
    const telemetry = document.getElementById('telemetry-output');
    
    telemetry.innerHTML += "\n\n⭐ MISSION ACCOMPLISHED! NEXT MODULE UNLOCKED.";
    nextBtn.style.display = "block";
    
    // Save to the Mission Log
    const currentLvl = parseInt(document.body.dataset.level);
    missionData.completedLevels.push(currentLvl);
    missionData.currentLevel = currentLvl + 1;
    saveProgress(); 
}

// Start booting as soon as the page loads
bootPython();
