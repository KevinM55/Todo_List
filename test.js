const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = 5000;

// Create and connect to the SQLite database
const db = new sqlite3.Database("./tasks.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files (e.g., index.html)

// Serve the index.html page when accessing the root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch all tasks from the database
app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
            console.error("Error fetching tasks:", err.message);
            res.status(500).json({ error: "Failed to retrieve tasks" });
        } else {
            res.json(rows); // Send tasks as JSON
        }
    });
});

// Add a new task to the database
app.post("/tasks", (req, res) => {
    const { text } = req.body;
    const sql = "INSERT INTO tasks (text, completed) VALUES (?, ?)";
    db.run(sql, [text, false], function (err) {
        if (err) {
            console.error("Error adding task:", err.message);
            res.status(500).json({ error: "Failed to add task" });
        } else {
            const newTask = { id: this.lastID, text, completed: false };
            res.json(newTask); // Send the new task as JSON
        }
    });
});

// Update a task's completion status
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const sql = "UPDATE tasks SET completed = ? WHERE id = ?";
    db.run(sql, [completed, id], function (err) {
        if (err) {
            console.error("Error updating task:", err.message);
            res.status(500).json({ error: "Failed to update task" });
        } else {
            res.json({ id, completed }); // Return the updated task as JSON
        }
    });
});

// Delete a task from the database
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM tasks WHERE id = ?";
    db.run(sql, [id], function (err) {
        if (err) {
            console.error("Error deleting task:", err.message);
            res.status(500).json({ error: "Failed to delete task" });
        } else {
            res.status(200).json({ message: "Task deleted" }); // Respond with success message
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
