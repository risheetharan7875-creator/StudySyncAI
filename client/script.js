import {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    auth,
    provider,
    signInWithPopup,
    signOut
} from "./firebase.js";

import { GROQ_API_KEY } from "./config.js";

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");

const completedTasks = document.getElementById("completedTasks");

const pendingTasks = document.getElementById("pendingTasks");

const productivityRate = document.getElementById("productivityRate");

const productivityMessage = document.getElementById("productivityMessage");

const aiTip = document.getElementById("aiTip");

const analyticsTotalTasks = document.getElementById("analyticsTotalTasks");

const analyticsCompletedTasks = document.getElementById("analyticsCompletedTasks");

const analyticsPendingTasks = document.getElementById("analyticsPendingTasks");

const analyticsProductivityRate = document.getElementById("analyticsProductivityRate");

const analyticsProductivityMessage = document.getElementById("analyticsProductivityMessage");

const analyticsAiTip = document.getElementById("analyticsAiTip");

const loginBtn = document.getElementById("loginBtn");

const logoutBtn = document.getElementById("logoutBtn");

const askAIBtn = document.getElementById("askAIBtn");

const aiPrompt = document.getElementById("aiPrompt");

const aiResponse = document.getElementById("aiResponse");

const aiMode = document.getElementById("aiMode");

const customMinutes = document.getElementById("customMinutes");

const timerMessage = document.getElementById("timerMessage");

const profileUserName = document.getElementById("profileUserName");

const profileSectionUserName = document.getElementById("profileSectionUserName");

const profileTotalTasks = document.getElementById("profileTotalTasks");

const profileCompletedTasks = document.getElementById("profileCompletedTasks");

const profileProductivityRate = document.getElementById("profileProductivityRate");

const deadlineReminder = document.getElementById("deadlineReminder");

// GLOBAL TASK ARRAY
let tasks = [];

// NAVIGATION LINKS
const navLinks = document.querySelectorAll(".nav-links a");

// ==========================
// SMART AI ASSISTANT
// ==========================

function generateAITip(
    total,
    completed,
    overdue
) {

    const percentage =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // OVERDUE PRIORITY

    if(overdue >= 3) {

        return `
        You have several overdue tasks.
        Focus on completing high-priority work first.
        `;

    }

    // LOW PRODUCTIVITY

    if(percentage < 30) {

        return `
        Your productivity is currently low.
        Try studying in short focused sessions.
        `;

    }

    // MODERATE PRODUCTIVITY

    if(percentage < 70) {

        return `
        Good progress so far.
        Stay consistent and avoid procrastination.
        `;

    }

    // HIGH PRODUCTIVITY

    return `
    Excellent productivity level.
    Keep maintaining your momentum.
    `;
}

// ==========================
// GOOGLE AUTHENTICATION
// ==========================

loginBtn.addEventListener(
    "click",
    async () => {

        try {

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );

            profileUserName.textContent =
                result.user.displayName;

            profileSectionUserName.textContent =
                result.user.displayName;

            loadTasks();

            console.log(
                "Login Successful"
            );

        }
        catch(error) {

            console.log(error);

            alert(
                "Login Failed"
            );
        }
    }
);


logoutBtn.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        profileUserName.textContent =
            "Not Logged In";

        profileSectionUserName.textContent =
            "Not Logged In";

        taskList.innerHTML = "";

        tasks = [];
        
        renderAnalyticsChart();
        
        console.log(
            "Logged Out"
        );
    }
);

// ==========================
// SECTION NAVIGATION
// ==========================

navLinks.forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        const targetSection =
            this.getAttribute("data-section");

        document
            .querySelectorAll("section")
            .forEach(section => {

                section.style.display = "none";

            });

        document.getElementById(
            targetSection
        ).style.display = "block";

    });

});

// ==========================
// LOAD TASKS
// ==========================

async function loadTasks() {

    if (!auth.currentUser) return;

    taskList.innerHTML = "";

    tasks = [];

    let total = 0;
    let completed = 0;

    let overdueCount = 0;

    const querySnapshot =
        await getDocs(
            collection(
                db,
                "users",
                auth.currentUser.uid,
                "tasks"
            )
        );

    querySnapshot.forEach((taskDoc) => {

        const task = taskDoc.data();
        tasks.push(task);
        const today = new Date().toISOString().split("T")[0];

        const isOverdue =
            task.dueDate &&
            task.dueDate < today &&
            !task.completed;

        total++;

        if(task.completed) {
            completed++;
        }

        const li = document.createElement("li");
        if(isOverdue) {

            li.style.border =
                "2px solid red";

        }

        if(isOverdue) {

            overdueCount++;

        }

        li.innerHTML = `

            <div>

                <h3 style="
                    margin-bottom:8px;
                    text-decoration:
                    ${task.completed ? "line-through" : "none"};
                ">
                    ${task.title}
                </h3>

                <p>📅 Due: ${task.dueDate || "No Date"}</p>

                <p>
                    ⚡ Priority:
                    <strong style="
                    color:
                    ${task.priority === "High"
                    ? "#ef4444"
                    : task.priority === "Medium"
                    ? "#facc15"
                    : "#22c55e"}
                    ">
                    ${task.priority}
                    </strong>
                </p>

            </div>

            <div style="
                display:flex;
                gap:10px;
                align-items:center;
            ">

                <button class="complete-btn">
                    ${task.completed ? "Completed" : "Complete"}
                </button>

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>

        `;

        // COMPLETE BUTTON

        li.querySelector(".complete-btn")
        .addEventListener("click", async () => {

            await updateDoc(
                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "tasks",
                    taskDoc.id
                ),
                {
                    completed: !task.completed
                }
            );

            loadTasks();
        });

        // EDIT BUTTON

        li.querySelector(".edit-btn")
        .addEventListener("click", async () => {

            const newTitle =
                prompt("Edit task title:", task.title);

            if(newTitle === null || newTitle.trim() === "") {
                return;
            }

            const newDueDate =
                prompt("Edit due date:", task.dueDate);

            const newPriority =
                prompt(
                    "Edit priority (Low, Medium, High):",
                    task.priority
                );

            await updateDoc(
                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "tasks",
                    taskDoc.id
                ),
                {
                    title: newTitle,
                    dueDate: newDueDate,
                    priority: newPriority
                }
            );

            loadTasks();
        });

        // DELETE BUTTON
        li.querySelector(".delete-btn")
        .addEventListener("click", async () => {

            await deleteDoc(
                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "tasks",
                    taskDoc.id
                )
            );
            loadTasks();
        });

        taskList.appendChild(li);
    });

    // ANALYTICS

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = total - completed;

    const percentage =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);

    productivityRate.textContent =
        percentage + "%";

    analyticsTotalTasks.textContent = total;
    analyticsCompletedTasks.textContent = completed;
    analyticsPendingTasks.textContent = total - completed;
    analyticsProductivityRate.textContent = percentage + "%";

    profileTotalTasks.textContent = total;

    profileCompletedTasks.textContent = completed;

    profileProductivityRate.textContent =
        percentage + "%";

    // PRODUCTIVITY MESSAGE

    if (percentage === 0) {

        productivityMessage.textContent =
            "Let's get started 🚀";
        analyticsProductivityMessage.textContent =
            "Let's get started 🚀";

    }
    else if (percentage < 50) {

        productivityMessage.textContent =
            "Good progress 🔥";
        analyticsProductivityMessage.textContent =
            "Good progress 🔥";

    }
    else if (percentage < 100) {

        productivityMessage.textContent =
            "Excellent productivity 🌟";
        analyticsProductivityMessage.textContent =
            "Excellent productivity 🌟";

    }
    else {

        productivityMessage.textContent =
            "Perfect completion 🏆";
        analyticsProductivityMessage.textContent =
            "Perfect completion 🏆";

    }

    // AI ANALYSIS

    const aiText = generateAITip(
            total,
            completed,
            overdueCount
        );

    aiTip.textContent = aiText;
    analyticsAiTip.textContent = aiText;

    if (overdueCount > 0) {

        deadlineReminder.textContent =
            `⚠️ You have ${overdueCount} overdue task(s)`;

    }
    else {

        const upcomingTasks =
            tasks.filter(task => {

                if (!task.dueDate || task.completed) {
                    return false;
                }

                const today =
                    new Date();

                const due =
                    new Date(task.dueDate);

                const diff =
                    Math.ceil(
                        (due - today)
                        / (1000 * 60 * 60 * 24)
                    );

                return diff <= 3 && diff >= 0;
            });

        if (upcomingTasks.length > 0) {

            deadlineReminder.textContent =
                `⏰ ${upcomingTasks.length} task(s) due soon`;

        }
        else {

            deadlineReminder.textContent =
                "✅ All tasks are on track";

        }
    }

renderAnalyticsChart();

}


// ==========================
// ADD TASK
// ==========================

window.addTask = async function () {

    const input =
        document.getElementById("taskInput");

    const dueDate =
        document.getElementById("dueDate");

    const priority =
        document.getElementById("priority");

    const taskTitle = input.value.trim();
    if (taskTitle === "") return;

    await addDoc(
        collection(
            db,
            "users",
            auth.currentUser.uid,
            "tasks"
        ),
    {

        title: taskTitle,

        dueDate: dueDate.value,

        priority: priority.value,

        completed: false

    });

    input.value = "";
    dueDate.value = "";

    loadTasks();
}


// ==========================
// INITIAL LOAD
// ==========================

loadTasks();

// ==========================
// POMODORO TIMER
// ==========================

let timer;
let defaultMinutes = 25;
let timeLeft = defaultMinutes * 60;
let isRunning = false;
let isBreak = false;

const timerDisplay =
    document.getElementById("timerDisplay");

const startTimerBtn =
    document.getElementById("startTimerBtn");

const pauseTimerBtn =
    document.getElementById("pauseTimerBtn");

const resetTimerBtn =
    document.getElementById("resetTimerBtn");


function updateTimerDisplay() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function startTimer() {

    if (isRunning) return;

    if (customMinutes.value) {

        defaultMinutes =
            parseInt(customMinutes.value);

        timeLeft =
            defaultMinutes * 60;
    }

    timerMessage.textContent = "";

    isRunning = true;

    timer = setInterval(() => {

        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {

            clearInterval(timer);

            isRunning = false;

            const messages = [
                "🎉 Excellent work! You completed your session.",
                "🔥 Great focus! Keep up the momentum.",
                "🏆 Well done! Another productive session completed.",
                "✨ You made it! Consistency builds success."
            ];

            const randomMessage =
                messages[
                    Math.floor(
                        Math.random() * messages.length
                    )
                ];

            timerMessage.textContent =
                randomMessage;
        }

    }, 1000);
}


function pauseTimer() {

    clearInterval(timer);

    isRunning = false;
}


function resetTimer() {

    clearInterval(timer);

    isRunning = false;

    timeLeft =
        defaultMinutes * 60;

    timerMessage.textContent = "";

    updateTimerDisplay();
}


startTimerBtn.addEventListener(
    "click",
    startTimer
);

pauseTimerBtn.addEventListener(
    "click",
    pauseTimer
);

resetTimerBtn.addEventListener(
    "click",
    resetTimer
);


updateTimerDisplay();

// ==========================
// ANALYTICS CHART
// ==========================

const chartCanvas =
    document.getElementById("analyticsChart");

let analyticsChart;

function renderAnalyticsChart() {

    const completed =
        tasks.filter(task => task.completed).length;

    const pending =
        tasks.length - completed;

    if (analyticsChart) {
        analyticsChart.destroy();
    }

    analyticsChart = new Chart(chartCanvas, {

        type: "bar",

        data: {
            labels: ["Completed", "Pending"],

            datasets: [{
                label: "Task Status",
                data: [completed, pending],
                backgroundColor: [
                    "#22c55e",
                    "#3b82f6"
                ],
                borderRadius: 12
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                },

                x: {
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                }
            },

            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            }
        }
    });
}

// ==========================
// GROQ AI ASSISTANT
// ==========================

window.askAI = async function () {

    console.log("AI button clicked");
    
    const prompt = aiPrompt.value.trim();

    if (!prompt) {
        alert("Please enter a question.");
        return;
    }

    aiResponse.innerHTML =
        `<div class="spinner"></div>`;

    try {

        const mode = aiMode.value;

        let systemPrompt = "";

        if (mode === "explain") {

            systemPrompt =
                "Explain concepts clearly and simply for students.";

        }
        else if (mode === "summarize") {

            systemPrompt =
                "Summarize study notes into concise key points.";

        }
        else if (mode === "quiz") {

            systemPrompt =
                "Generate quiz questions with answers for revision.";

        }
        else if (mode === "tips") {

            systemPrompt =
                "Provide practical and effective study advice for students.";

        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },

                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
            aiResponse.textContent =
                "API Error: " + data.error.message;
            return;
        }

        aiResponse.textContent =
            data.choices[0].message.content;

    }
    catch (error) {

        console.log(error);

        aiResponse.textContent =
            "AI request failed.";
    }
}