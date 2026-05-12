import {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "./firebase.js";

const taskList = document.getElementById("taskList");

// LOAD TASKS
async function loadTasks() {

    taskList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "tasks"));

    querySnapshot.forEach((taskDoc) => {

        const task = taskDoc.data();

        const li = document.createElement("li");

        li.innerHTML = `
            <span>${task.title}</span>
            <button class="delete-btn" onclick="deleteTask('${taskDoc.id}')">
                Delete
            </button>
        `;

        taskList.appendChild(li);
    });
}

// ADD TASK
window.addTask = async function () {

    const input = document.getElementById("taskInput");

    if(input.value === "") return;

    await addDoc(collection(db, "tasks"), {
        title: input.value
    });

    input.value = "";

    loadTasks();
}

// DELETE TASK
window.deleteTask = async function (id) {

    await deleteDoc(doc(db, "tasks", id));

    loadTasks();
}

// INITIAL LOAD
loadTasks();