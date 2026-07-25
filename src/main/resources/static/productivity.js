const totalTasks = 4;

let completed = 0;

for(let i=0;i<totalTasks;i++){

    if(localStorage.getItem("task"+i)=="true"){
        completed++;
    }

}

document.getElementById("completedTasks").innerHTML =
completed + " / " + totalTasks + " Tasks";

const score = Math.round((completed/totalTasks)*100);

document.getElementById("score").innerHTML =
score + "%";


// ---------- Focus Time ----------

let sessions = Number(localStorage.getItem("pomodoroSessions")) || 0;

let totalMinutes = sessions*25;

let hours = Math.floor(totalMinutes/60);

let minutes = totalMinutes%60;

let text="";

if(hours>0){

    text += hours + "h ";

}

text += minutes + "m";

document.getElementById("focusTime").innerHTML = text;

document.getElementById("sessionCount").innerHTML =
sessions + " Session" + (sessions==1 ? "" : "s");