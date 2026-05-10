const API = "http://localhost:5000/tasks";

// LOAD TASKS
async function loadTasks() {

    const response = await fetch(API);

    const tasks = await response.json();

    console.log(tasks);

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>${task.title}</span>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">
                Delete
            </button>
        `;

        taskList.appendChild(li);
    });
}

// ADD TASK
async function addTask() {

    const input = document.getElementById("taskInput");

    const title = input.value;

    if(title === "") {
        return;
    }

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    });

    input.value = "";

    loadTasks();
}

// DELETE TASK
async function deleteTask(id) {

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

// RUN WHEN PAGE LOADS
window.onload = function () {
    loadTasks();
};