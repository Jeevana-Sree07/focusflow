/* ---------- storage ---------- */
function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }

/* ---------- navigation ---------- */
const home = document.getElementById("home");
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  if (id === "home") { home.classList.remove("hidden"); return; }
  home.classList.add("hidden");
  document.getElementById(id).classList.add("active");
  if (id === "page-planner") renderPlanner();
  if (id === "page-productivity") renderProductivity();
}
document.querySelectorAll(".card[data-target]").forEach(c =>
  c.addEventListener("click", () => showPage(c.dataset.target)));
document.querySelectorAll("[data-back]").forEach(b =>
  b.addEventListener("click", () => showPage("home")));

/* ---------- tasks ---------- */
let tasks = loadJSON("hub_tasks", [
  { id: 1, text: "Java Assignment", done: false },
  { id: 2, text: "DSA Practice", done: true },
  { id: 3, text: "Mini Project", done: false },
  { id: 4, text: "Aptitude Practice", done: false }
]);
let selectedTaskId = null;
const taskList = document.getElementById("task-list");

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "task-item" + (t.done ? " done" : "") + (t.id === selectedTaskId ? " selected" : "");

    const chk = document.createElement("span");
    chk.className = "chk";
    chk.textContent = t.done ? "☑" : "☐";
    chk.addEventListener("click", e => { e.stopPropagation(); toggleTask(t.id); });

    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = t.text;

    li.append(chk, txt);
    li.addEventListener("click", () => selectTask(t.id));
    taskList.appendChild(li);
  });
  saveJSON("hub_tasks", tasks);
}

function selectTask(id) {
  selectedTaskId = (selectedTaskId === id) ? null : id;
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  t.done = !t.done;
  if (t.done) {
    const daily = loadJSON("hub_daily", {});
    daily[todayKey()] = (daily[todayKey()] || 0) + 1;
    saveJSON("hub_daily", daily);
  }
  renderTasks();
}

function addTask() {
  const text = window.prompt("Enter new task:");
  if (!text || !text.trim()) return;
  tasks.push({ id: Date.now(), text: text.trim(), done: false });
  renderTasks();
}

function editTask() {
  if (!selectedTaskId) { alert("Select a task first."); return; }
  const t = tasks.find(t => t.id === selectedTaskId);
  const text = window.prompt("Edit task:", t.text);
  if (!text || !text.trim()) return;
  t.text = text.trim();
  renderTasks();
}

function deleteTask() {
  if (!selectedTaskId) { alert("Select a task first."); return; }
  tasks = tasks.filter(t => t.id !== selectedTaskId);
  selectedTaskId = null;
  renderTasks();
}

document.getElementById("add-new-link").addEventListener("click", addTask);
document.getElementById("btn-add").addEventListener("click", addTask);
document.getElementById("btn-edit").addEventListener("click", editTask);
document.getElementById("btn-delete").addEventListener("click", deleteTask);

renderTasks();

/* ---------- planner ---------- */
document.getElementById("regen-plan").addEventListener("click", renderPlanner);

function renderPlanner() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";
  const open = tasks.filter(t => !t.done);
  const blocks = [];
  let cursor = new Date();
  cursor.setMinutes(cursor.getMinutes() < 30 ? 0 : 30, 0, 0);
  if (open.length === 0) {
    blocks.push({ title: "Free planning time", sub: "No open tasks", minutes: 30 });
  } else {
    open.forEach((t, i) => {
      blocks.push({ title: t.text, sub: "Focus block", minutes: 45 });
      if (i < open.length - 1) blocks.push({ title: "Short break", sub: "Stretch, hydrate", minutes: 10 });
    });
  }
  blocks.push({ title: "Wrap up & review", sub: "Check off what got done", minutes: 15 });
  blocks.forEach(b => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="time">${formatTime(cursor)}</span>
      <div><div class="t-title">${b.title}</div><div class="t-sub">${b.sub} · ${b.minutes} min</div></div>`;
    timeline.appendChild(li);
    cursor = new Date(cursor.getTime() + b.minutes * 60000);
  });
}
function formatTime(date) {
  let h = date.getHours(); const m = date.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

/* ---------- productivity ---------- */
function renderProductivity() {
  const daily = loadJSON("hub_daily", {});
  const sessions = loadJSON("hub_sessions", 0);
  const completed = Object.values(daily).reduce((a, b) => a + b, 0);
  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-focus").textContent = sessions;
  let streak = 0, d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (daily[key]) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  document.getElementById("stat-streak").textContent = streak;

  const barsEl = document.getElementById("bars");
  barsEl.innerHTML = "";
  const days = [];
  for (let i = 6; i >= 0; i--) { const dd = new Date(); dd.setDate(dd.getDate() - i); days.push(dd); }
  const max = Math.max(1, ...days.map(dd => daily[dd.toISOString().slice(0, 10)] || 0));
  days.forEach(dd => {
    const count = daily[dd.toISOString().slice(0, 10)] || 0;
    const col = document.createElement("div"); col.className = "bar-col";
    col.innerHTML = `<div class="bar-fill" style="height:${Math.max(4, (count / max) * 90)}px"></div>
      <div class="bar-day">${dd.toLocaleDateString(undefined, { weekday: "narrow" })}</div>`;
    barsEl.appendChild(col);
  });
}

/* ---------- pomodoro ---------- */
const FOCUS = 25 * 60, BREAK = 5 * 60;
let mode = "focus", remaining = FOCUS, running = false, intervalId = null;
const timerDisplay = document.getElementById("timer-display");
const timerModeEl = document.getElementById("timer-mode");
const timerToggle = document.getElementById("timer-toggle");

function updateTimerUI() {
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
  timerModeEl.textContent = mode === "focus" ? "Focus" : "Break";
  document.getElementById("session-count").textContent = loadJSON("hub_sessions", 0);
}
function tick() {
  remaining--;
  if (remaining <= 0) {
    if (mode === "focus") {
      saveJSON("hub_sessions", loadJSON("hub_sessions", 0) + 1);
      mode = "break"; remaining = BREAK;
    } else { mode = "focus"; remaining = FOCUS; }
  }
  updateTimerUI();
}
function startTimer() { running = true; timerToggle.textContent = "Pause"; intervalId = setInterval(tick, 1000); }
function pauseTimer() { running = false; timerToggle.textContent = "Start"; clearInterval(intervalId); }
function resetTimer() { pauseTimer(); mode = "focus"; remaining = FOCUS; updateTimerUI(); }
timerToggle.addEventListener("click", () => running ? pauseTimer() : startTimer());
document.getElementById("timer-reset").addEventListener("click", resetTimer);
document.getElementById("timer-skip").addEventListener("click", () => { remaining = 1; tick(); });
updateTimerUI();