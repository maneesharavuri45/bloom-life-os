const KEY = "bloomLifeData";
const KEEP_DAYS = 10;

const CATEGORIES = {
    Work: "💻",
    Creative: "🧶",
    Wellness: "🌿",
    Learning: "🧠",
    Personal: "🏠",
    Explore: "📍"
};

const QUOTES = [
    "Small steps still move you forward. 🌷",
    "You don't have to do everything today. ✨",
    "Progress is progress, even when it feels tiny. 🌱",
    "Your future self will thank you for starting today. 💕",
    "A little consistency can create something beautiful. 🌸",
    "One task. One step. One day at a time. 🌷",
    "You showed up. That already matters. 💗",
    "Keep growing, even if nobody sees it yet. 🌱"
];


function load() {
    return JSON.parse(
        localStorage.getItem(KEY) ||
        '{"days":{}}'
    );
}


function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}


function today() {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}


function getDay() {

    const data = load();
    const d = today();

    if (!data.days[d]) {
        data.days[d] = {
            tasks: [],
            money: [],
            finished: false
        };
    }

    return data;
}


/* ---------- 10 DAY CLEANUP ---------- */

function cleanOldData(data) {

    const now = new Date(today());

    Object.keys(data.days).forEach(date => {

        const age =
            Math.floor(
                (now - new Date(date)) /
                86400000
            );

        if (age >= KEEP_DAYS) {
            delete data.days[date];
        }
    });

    save(data);
}


/* ---------- TASKS ---------- */

function addTask() {

    const input =
        document.getElementById("taskInput");

    const category =
        document.getElementById("taskCategory").value;

    const text = input.value.trim();

    if (!text) return;

    const data = getDay();
    const d = today();

    data.days[d].tasks.push({
        id: Date.now(),
        text,
        category,
        completed: false
    });

    save(data);

    input.value = "";

    render();
}


function toggleTask(id) {

    const data = getDay();
    const tasks = data.days[today()].tasks;

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;

    task.completed = !task.completed;

    save(data);
    render();
}


function deleteTask(id) {

    const data = getDay();

    data.days[today()].tasks =
        data.days[today()].tasks.filter(
            t => t.id !== id
        );

    save(data);
    render();
}


/* ---------- MONEY ---------- */

function addMoney() {

    const type =
        document.getElementById("moneyType").value;

    const amount =
        Number(
            document.getElementById("moneyAmount").value
        );

    const category =
        document.getElementById("moneyCategory").value;

    const note =
        document.getElementById("moneyNote").value.trim();

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const data = getDay();

    data.days[today()].money.push({
        id: Date.now(),
        type,
        amount,
        category,
        note
    });

    save(data);

    document.getElementById("moneyAmount").value = "";
    document.getElementById("moneyNote").value = "";

    renderMoney();
}


function deleteMoney(id) {

    const data = getDay();

    data.days[today()].money =
        data.days[today()].money.filter(
            x => x.id !== id
        );

    save(data);
    renderMoney();
}


/* ---------- MONEY DISPLAY ---------- */

function money(n) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(n);
}


function renderMoney() {

    const day =
        getDay().days[today()];

    let income = 0;
    let spent = 0;

    day.money.forEach(x => {

        if (x.type === "income")
            income += x.amount;
        else
            spent += x.amount;

    });

    document.getElementById("incomeTotal")
        .textContent = money(income);

    document.getElementById("expenseTotal")
        .textContent = money(spent);

    document.getElementById("savedTotal")
        .textContent = money(income - spent);


    const list =
        document.getElementById("moneyList");

    list.innerHTML = "";

    if (!day.money.length) {

        list.innerHTML =
            `<div class="empty-state">
                💸 No money records today.
             </div>`;

        return;
    }


    day.money.slice().reverse().forEach(x => {

        const row =
            document.createElement("div");

        row.className = "money-record";

        row.innerHTML = `
            <div>
                <strong>
                    ${x.type === "income" ? "💵" : "💸"}
                    ${x.category}
                </strong>

                <small>
                    ${x.note || "No note"}
                </small>
            </div>

            <div class="money-right">
                <strong>
                    ${x.type === "income" ? "+" : "-"}
                    ${money(x.amount)}
                </strong>

                <button
                    class="delete-money"
                    onclick="deleteMoney(${x.id})">
                    🗑️
                </button>
            </div>
        `;

        list.appendChild(row);
    });
}


/* ---------- CATEGORY SUMMARY ---------- */

function renderCategories() {

    const tasks =
        getDay().days[today()].tasks;

    const box =
        document.getElementById("categorySummary");

    box.innerHTML = "";

    Object.keys(CATEGORIES).forEach(category => {

        const list =
            tasks.filter(
                t => t.category === category
            );

        const done =
            list.filter(
                t => t.completed
            ).length;

        const card =
            document.createElement("div");

        card.className =
            "category-mini-card";

        card.innerHTML = `
            <span class="category-icon">
                ${CATEGORIES[category]}
            </span>

            <strong>${category}</strong>

            <small>
                ${done}/${list.length}
            </small>
        `;

        box.appendChild(card);
    });
}


/* ---------- TASK DISPLAY ---------- */

function renderTasks() {

    const tasks =
        getDay().days[today()].tasks;

    const box =
        document.getElementById("taskList");

    box.innerHTML = "";


    if (!tasks.length) {

        box.innerHTML =
            `<div class="empty-state">
                🌷 Your day is waiting.
                <br>Add your first little goal.
             </div>`;

        updateProgress();
        return;
    }


    tasks.forEach(task => {

        const row =
            document.createElement("div");

        row.className =
            `task ${task.completed ? "completed" : ""}`;

        row.innerHTML = `
            <button
                class="check"
                onclick="toggleTask(${task.id})">
                ${task.completed ? "✓" : "○"}
            </button>

            <div class="task-content">

                <span class="task-text">
                    ${escapeHTML(task.text)}
                </span>

                <span class="task-category">
                    ${CATEGORIES[task.category] || "✨"}
                    ${task.category}
                </span>

            </div>

            <button
                class="delete-task"
                onclick="deleteTask(${task.id})">
                🗑️
            </button>
        `;

        box.appendChild(row);
    });

    updateProgress();
}


function updateProgress() {

    const tasks =
        getDay().days[today()].tasks;

    const done =
        tasks.filter(t => t.completed).length;

    const total = tasks.length;

    const percent =
        total
            ? Math.round(done / total * 100)
            : 0;

    document.getElementById("progressText")
        .textContent =
        `${done} / ${total} completed • ${percent}%`;

    document.getElementById("xpCount")
        .textContent =
        `⭐ ${done * 10} XP`;
}


/* ---------- FINISH DAY ---------- */

function finishMyDay() {

    const data = getDay();
    const day = data.days[today()];

    if (!day.tasks.length) {
        alert("🌷 Add at least one goal first.");
        return;
    }

    day.finished = true;

    save(data);

    const done =
        day.tasks.filter(t => t.completed).length;

    const percent =
        Math.round(
            done / day.tasks.length * 100
        );

    document.getElementById("daySummary").innerHTML = `
        <div class="summary-icon">🌙</div>

        <h2>Your day is wrapped ✨</h2>

        <p>
            You completed
            <strong>${done}</strong>
            out of
            <strong>${day.tasks.length}</strong>
            goals.
        </p>

        <div class="summary-progress">
            ${percent}%
        </div>

        <p class="summary-message">
            ${
                percent === 100
                    ? "You completed everything! 🌸"
                    : percent >= 70
                        ? "You made beautiful progress today. 🌷"
                        : "Tomorrow is another little beginning. 🌱"
            }
        </p>
    `;

    document.getElementById("daySummary")
        .classList.add("show");
}


/* ---------- HISTORY ---------- */

function showHistory() {

    const data = load();
    const box =
        document.getElementById("historyList");

    box.innerHTML = "";

    const dates =
        Object.keys(data.days)
            .sort()
            .reverse();

    if (!dates.length) {
        box.innerHTML =
            `<div class="empty-state">
                🌸 Your history will appear here.
             </div>`;
        return;
    }

    dates.forEach(date => {

        const day = data.days[date];

        const total = day.tasks.length;

        const done =
            day.tasks.filter(t => t.completed).length;

        const percent =
            total
                ? Math.round(done / total * 100)
                : 0;

        const row =
            document.createElement("div");

        row.className = "history-card";

        row.innerHTML = `
            <div>
                <strong>
                    ${formatDate(date)}
                </strong>

                <p>
                    ${done} of ${total} completed
                </p>
            </div>

            <div class="history-percent">
                ${percent}%
            </div>
        `;

        box.appendChild(row);
    });
}


/* ---------- DAILY EXPERIENCE ---------- */

function updateDailyExperience() {

    const now = new Date();
    const hour = now.getHours();

    let greeting = "Hello";

    if (hour >= 5 && hour < 12)
        greeting = "Good morning";

    else if (hour >= 12 && hour < 17)
        greeting = "Good afternoon";

    else if (hour >= 17 && hour < 22)
        greeting = "Good evening";

    else
        greeting = "Still awake";

    document.getElementById("greeting")
        .textContent =
        `${greeting}, Maneesha 🌸`;

    document.getElementById("todayDate")
        .textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    const dayNumber =
        Math.floor(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            ).getTime() / 86400000
        );

    document.getElementById("dailyQuote")
        .textContent =
        `"${QUOTES[
            dayNumber % QUOTES.length
        ]}"`;
}


/* ---------- HELPERS ---------- */

function formatDate(date) {

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short"
        }
    );
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ---------- START ---------- */

function render() {

    renderTasks();
    renderCategories();
    renderMoney();
}


function startBloom() {

    const data = load();

    cleanOldData(data);

    getDay();

    updateDailyExperience();

    render();

    showHistory();
}


document.addEventListener(
    "DOMContentLoaded",
    startBloom
);
