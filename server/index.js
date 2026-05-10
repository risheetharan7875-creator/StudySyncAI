const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];

// GET ALL TASKS
app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// ADD TASK
app.post("/tasks", (req, res) => {

    const newTask = {
        id: Date.now().toString(),
        title: req.body.title
    };

    tasks.push(newTask);

    res.json(newTask);
});

// DELETE TASK
app.delete("/tasks/:id", (req, res) => {

    const id = req.params.id;

    tasks = tasks.filter(task => task.id !== id);

    res.json({
        message: "Task deleted"
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});