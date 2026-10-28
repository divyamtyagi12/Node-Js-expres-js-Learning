// Selecting HTML elements
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Load tasks from local storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks
function displayTasks() {

    taskList.innerHTML = "";

    tasks.forEach((task) => {

        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = task.text;
        span.classList.add("task-text");

        if (task.completed) {
            span.classList.add("completed");
        }

        // Mark task as completed
        span.addEventListener("click", () => {
            task.completed = !task.completed;

            saveTasks();
            displayTasks();
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", () => {

            tasks = tasks.filter((t) => t.id !== task.id);

            saveTasks();
            displayTasks();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

// Add new task
function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    displayTasks();

    taskInput.value = "";
}

// Button event
addBtn.addEventListener("click", addTask);

// Enter key event
taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Display saved tasks when page loads
displayTasks();