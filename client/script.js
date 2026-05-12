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

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const productivityRate = document.getElementById("productivityRate");

const productivityMessage = document.getElementById("productivityMessage");

const aiTip = document.getElementById("aiTip");

//AUTH ELEMENTS

const loginBtn = document.getElementById("loginBtn");

const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");

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

            userName.textContent =
                result.user.displayName;

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

        userName.textContent =
            "Not Logged In";

        console.log(
            "Logged Out"
        );
    }
);

// ==========================
// LOAD TASKS
// ==========================

async function loadTasks() {

    taskList.innerHTML = "";

    let total = 0;
    let completed = 0;

    let overdueCount = 0;

    const querySnapshot =
        await getDocs(collection(db, "tasks"));

    querySnapshot.forEach((taskDoc) => {

        const task = taskDoc.data();
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
                doc(db, "tasks", taskDoc.id),
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
                doc(db, "tasks", taskDoc.id),
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

            await deleteDoc(doc(db, "tasks", taskDoc.id));

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

    // PRODUCTIVITY MESSAGE

    if (percentage === 0) {

        productivityMessage.textContent =
            "Let's get started 🚀";

    }
    else if (percentage < 50) {

        productivityMessage.textContent =
            "Good progress 🔥";

    }
    else if (percentage < 100) {

        productivityMessage.textContent =
            "Excellent productivity 🌟";

    }
    else {

        productivityMessage.textContent =
            "Perfect completion 🏆";

    }

    // AI ANALYSIS

    aiTip.textContent =
        generateAITip(
            total,
            completed,
            overdueCount
        );
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

    if(input.value === "") return;

    await addDoc(collection(db, "tasks"), {

        title: input.value,

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