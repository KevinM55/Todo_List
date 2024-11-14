document.addEventListener("DOMContentLoaded", fetchAndDisplayTasks); // Fetch tasks on page load

// Add task button functionality
document.querySelector("#add-task-btn").addEventListener("click", () => {
    const taskInput = document.getElementById("new-task");
    const text = taskInput.value.trim();
    if (text) {
        addTask(text); // Add the new task
        taskInput.value = ""; // Clear the input field
    }
});

// Fetch tasks from the backend and display them in the UI
function fetchAndDisplayTasks() {
    fetch("/tasks")
        .then(response => response.json()) // Parse the JSON response
        .then(tasks => {
            const taskListContainer = document.getElementById("task-list-container");
            taskListContainer.innerHTML = ""; // Clear the current task list

            // Render each task
            tasks.forEach(task => {
                const listItem = document.createElement("div");
                listItem.classList.add("task-item", "notification", "is-light", "box");
                if (task.completed) listItem.classList.add("completed");

                listItem.innerHTML = `
                    <div class="columns is-mobile is-vcentered">
                        <div class="column is-9">
                            <span class="has-text-weight-medium">${task.text}</span>
                            <div><small>Created: ${new Date(task.created_at).toLocaleString()}</small></div>
                            ${task.updated_at ? `<div><small>Updated: ${new Date(task.updated_at).toLocaleString()}</small></div>` : ""}
                        </div>
                        <div class="column is-3 has-text-right">
                            <button class="button is-success is-small complete-btn">✔</button>
                            <button class="button is-danger is-small delete-btn">✖</button>
                        </div>
                    </div>
                `;

                // Complete button toggles task completion
                listItem.querySelector(".complete-btn").addEventListener("click", () => {
                    toggleTaskCompletion(task.id, !task.completed);
                });

                // Delete button removes task
                listItem.querySelector(".delete-btn").addEventListener("click", () => {
                    deleteTask(task.id);
                });

                taskListContainer.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error fetching tasks:", error)); // Handle errors
}

// Function to add a new task
function addTask(text) {
    fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }), // Send task text
    })
        .then(response => response.json())
        .then(() => {
            fetchAndDisplayTasks(); // Refresh the task list
        })
        .catch(error => console.error("Error adding task:", error));
}

// Function to toggle task completion status
function toggleTaskCompletion(id, completed) {
    fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }), // Send updated completion status
    })
        .then(response => response.json())
        .then(() => {
            fetchAndDisplayTasks(); // Refresh the task list after update
        })
        .catch(error => console.error("Error updating task:", error));
}

// Function to delete a task
function deleteTask(id) {
    fetch(`/tasks/${id}`, {
        method: "DELETE",
    })
        .then(() => {
            fetchAndDisplayTasks(); // Refresh the task list after deletion
        })
        .catch(error => console.error("Error deleting task:", error));
}
