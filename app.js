// 🌸 BLOOM — Daily Life Data

const RETENTION_DAYS = 10;
const STORAGE_KEY = "bloomLifeData";


// =========================
// LOAD DATA
// =========================

function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return {
            days: {}
        };
    }

    return JSON.parse(saved);
}


// =========================
// SAVE DATA
// =========================

function saveData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// =========================
// LOCAL DATE
// =========================

function getToday() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================
// CLEAN OLD DATA
// =========================

function cleanOldData(data) {

    const today = new Date(
        getToday() + "T00:00:00"
    );

    Object.keys(data.days).forEach(date => {

        const savedDate = new Date(
            date + "T00:00:00"
        );

        const difference =
            Math.floor(
                (today - savedDate) /
                (1000 * 60 * 60 * 24)
            );

        if (difference >= RETENTION_DAYS) {

            delete data.days[date];

        }

    });

    saveData(data);
}


// =========================
// GET TODAY'S DATA
// =========================

function getTodayData() {

    const data = loadData();

    const today = getToday();

    if (!data.days[today]) {

        data.days[today] = {

            tasks: [],

            xp: 0,

            notes: "",

            finished: false,

            finishedAt: null

        };

        saveData(data);

    }

    return data;

}


// =========================
// ADD TASK
// =========================

function addTask() {

    const input =
        document.getElementById(
            "taskInput"
        );

    const taskText =
        input.value.trim();

    if (!taskText) {

        return;

    }

    const data = getTodayData();

    const today = getToday();

    data.days[today].tasks.push({

        id: Date.now(),

        text: taskText,

        completed: false

    });

    saveData(data);

    input.value = "";

    displayTasks();

}


// =========================
// COMPLETE TASK
// =========================

function toggleTask(id) {

    const data = getTodayData();

    const today = getToday();

    const task =
        data.days[today].tasks.find(
            task => task.id === id
        );

    if (!task) {

        return;

    }

    task.completed =
        !task.completed;

    saveData(data);

    displayTasks();

}


// =========================
// DISPLAY TASKS
// =========================

function displayTasks() {

    const container =
        document.getElementById(
            "taskList"
        );

    const data = getTodayData();

    const today = getToday();

    const tasks =
        data.days[today].tasks;

    container.innerHTML = "";


    if (tasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                🌷 Your day is waiting.
                <br>

                Add your first little goal.

            </div>

        `;

        updateProgress();

        return;

    }


    tasks.forEach(task => {

        const taskElement =
            document.createElement("div");

        taskElement.className =
            `task ${
                task.completed
                    ? "completed"
                    : ""
            }`;


        taskElement.innerHTML = `

            <button
                class="check"
                onclick="toggleTask(${task.id})"
            >
                ${
                    task.completed
                        ? "✓"
                        : "○"
                }
            </button>

            <span>
                ${task.text}
            </span>

        `;


        container.appendChild(
            taskElement
        );

    });


    updateProgress();

}


// =========================
// UPDATE PROGRESS
// =========================

function updateProgress() {

    const data = getTodayData();

    const today = getToday();

    const tasks =
        data.days[today].tasks;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const total =
        tasks.length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    const progress =
        document.getElementById(
            "progressText"
        );


    if (progress) {

        progress.innerHTML =
            `${completed} / ${total} completed • ${percentage}%`;

    }


    const xp =
        document.getElementById(
            "xpCount"
        );


    if (xp) {

        xp.innerHTML =
            `⭐ ${completed * 10} XP`;

    }

}


// =========================
// FINISH MY DAY
// =========================

function finishMyDay() {

    const data = getTodayData();

    const today = getToday();

    const day =
        data.days[today];

    const total =
        day.tasks.length;

    const completed =
        day.tasks.filter(
            task => task.completed
        ).length;

    if (total === 0) {

        alert(
            "🌷 Add at least one little goal before finishing your day."
        );

        return;

    }


    day.finished = true;

    day.finishedAt =
        new Date().toISOString();


    saveData(data);

    showDaySummary(
        completed,
        total
    );

}


// =========================
// DAY SUMMARY
// =========================

function showDaySummary(
    completed,
    total
) {

    const percentage =
        Math.round(
            (completed / total) * 100
        );


    const summary =
        document.getElementById(
            "daySummary"
        );


    summary.innerHTML = `

        <div class="summary-icon">
            🌙
        </div>

        <h2>
            Your day is wrapped ✨
        </h2>

        <p>
            You completed
            <strong>
                ${completed}
            </strong>
            out of
            <strong>
                ${total}
            </strong>
            goals.
        </p>

        <div class="summary-progress">
            ${percentage}%
        </div>

        <p class="summary-message">

            ${
                percentage === 100
                    ? "You completed everything! 🌸"
                    : percentage >= 70
                        ? "You made beautiful progress today. 🌷"
                        : percentage >= 40
                            ? "You still moved forward today. 💕"
                            : "Tomorrow is another little beginning. 🌱"
            }

        </p>

    `;


    summary.classList.add(
        "show"
    );

}


// =========================
// HISTORY
// =========================

function showHistory() {

    const data = loadData();

    const history =
        document.getElementById(
            "historyList"
        );

    history.innerHTML = "";


    const dates =
        Object.keys(data.days)
            .sort()
            .reverse();


    if (dates.length === 0) {

        history.innerHTML = `

            <div class="empty-state">

                🌸 Your history will appear here.

            </div>

        `;

        return;

    }


    dates.forEach(date => {

        const day =
            data.days[date];

        const total =
            day.tasks.length;

        const completed =
            day.tasks.filter(
                task => task.completed
            ).length;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                );


        const historyCard =
            document.createElement(
                "div"
            );

        historyCard.className =
            "history-card";


        historyCard.innerHTML = `

            <div>

                <strong>
                    ${formatDate(date)}
                </strong>

                <p>
                    ${completed} of ${total} completed
                </p>

            </div>

            <div class="history-percent">

                ${percentage}%

            </div>

        `;


        history.appendChild(
            historyCard
        );

    });

}


// =========================
// START BLOOM
// =========================

function startBloom() {

    const data = loadData();

    cleanOldData(data);

    getTodayData();

    displayTasks();

}


// =========================
// PAGE LOAD
// =========================

document.addEventListener(
    "DOMContentLoaded",
    startBloom
);

// =========================
// DAILY BLOOM EXPERIENCE
// =========================

const bloomQuotes = [

    "Small steps still move you forward. 🌷",

    "You don't have to do everything today. Just do what matters. ✨",

    "Progress is progress, even when it feels tiny. 🌱",

    "Your future self will thank you for starting today. 💕",

    "A little consistency can create something beautiful. 🌸",

    "You are allowed to go at your own pace. 🦋",

    "One task. One step. One day at a time. 🌷",

    "Make today a little better than yesterday. ✨",

    "You showed up. That already matters. 💗",

    "Keep growing, even if nobody sees it yet. 🌱"

];


function updateDailyExperience() {

    const now = new Date();

    const hour = now.getHours();


    // ---------- GREETING ----------

    let greeting = "Hello";

    if (hour >= 5 && hour < 12) {

        greeting = "Good morning";

    } else if (hour >= 12 && hour < 17) {

        greeting = "Good afternoon";

    } else if (hour >= 17 && hour < 22) {

        greeting = "Good evening";

    } else {

        greeting = "Still awake";

    }


    const greetingElement =
        document.getElementById(
            "greeting"
        );


    if (greetingElement) {

        greetingElement.innerHTML =
            `${greeting}, Maneesha 🌸`;

    }


    // ---------- DATE ----------

    const dateElement =
        document.getElementById(
            "todayDate"
        );


    if (dateElement) {

        dateElement.innerHTML =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    // ---------- DAILY QUOTE ----------

    const quoteElement =
        document.getElementById(
            "dailyQuote"
        );


    if (quoteElement) {

        const dayNumber =
            Math.floor(
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                ).getTime()
                /
                (1000 * 60 * 60 * 24)
            );


        const quoteIndex =
            dayNumber %
            bloomQuotes.length;


        quoteElement.innerHTML =
            `"${bloomQuotes[quoteIndex]}"`;

    }

}


// Run immediately

updateDailyExperience();
