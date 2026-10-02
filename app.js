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
// GET TODAY
// =========================

function getToday() {

    const today = new Date();

    return today.toISOString().split("T")[0];

}


// =========================
// REMOVE DATA OLDER THAN
// 10 DAYS
// =========================

function cleanOldData(data) {

    const today = new Date();

    Object.keys(data.days).forEach(date => {

        const savedDate = new Date(date);

        const difference =
            (today - savedDate) /
            (1000 * 60 * 60 * 24);

        if (difference > RETENTION_DAYS) {

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

            notes: ""

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
        document.getElementById("taskInput");

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
// COMPLETE / UNCOMPLETE TASK
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
        document.getElementById("taskList");

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
// UPDATE PROGRESS + XP
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
// START BLOOM
// =========================

function startBloom() {

    const data = loadData();

    cleanOldData(data);

    getTodayData();

    displayTasks();

}


// =========================
// START WHEN PAGE LOADS
// =========================

document.addEventListener(
    "DOMContentLoaded",
    startBloom
);
