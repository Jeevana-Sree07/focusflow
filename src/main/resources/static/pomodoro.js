let minutes = 25;
let seconds = 0;

let timer = null;

function updateDisplay() {

    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("time").innerHTML = m + ":" + s;
}

function startTimer() {

    if (timer) return;

    timer = setInterval(function () {

        if (seconds === 0) {

            if (minutes === 0) {

                clearInterval(timer);
                timer = null;

                alert("Pomodoro Completed!");

                return;
            }

            minutes--;
            seconds = 59;

        } else {

            seconds--;

        }

        updateDisplay();

    },1000);

}

function pauseTimer() {

    clearInterval(timer);

    timer = null;

}

function resetTimer() {

    clearInterval(timer);

    timer = null;

    minutes = 25;
    seconds = 0;

    updateDisplay();

}

updateDisplay();