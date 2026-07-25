console.log("Pomodoro JS Loaded");

// Load completed sessions
let completedSessions = Number(localStorage.getItem("pomodoroSessions")) || 0;

// Display completed sessions when page loads
document.getElementById("sessionCount").textContent = completedSessions;

// Timer values
let minutes = 25;
let seconds = 0;

let timer = null;

// Update timer display
function updateDisplay() {

    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("time").textContent = m + ":" + s;
}

// Start Timer
function startTimer() {

    if (timer) return;

    timer = setInterval(function () {

        if (seconds === 0) {

            if (minutes === 0) {

                clearInterval(timer);
                timer = null;

                // Increase completed sessions
                completedSessions++;

                // Save in localStorage
                localStorage.setItem("pomodoroSessions", completedSessions);

                // Update session count on page
                document.getElementById("sessionCount").textContent = completedSessions;

                alert("Pomodoro Session Completed!");

                // Reset timer automatically
                minutes = 25;
                seconds = 0;
                updateDisplay();

                return;
            }

            minutes--;
            seconds = 59;

        } else {

            seconds--;

        }

        updateDisplay();

    }, 1000);
}

// Pause Timer
function pauseTimer() {

    clearInterval(timer);
    timer = null;

}

// Reset Timer
function resetTimer() {

    clearInterval(timer);
    timer = null;

    minutes = 25;
    seconds = 0;

    updateDisplay();

}

// Initial display
updateDisplay();
