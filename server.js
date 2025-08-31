const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('task_manager.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT NOT NULL,
            status TEXT NOT NULL
        )`);
    }
});

// Get all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single task
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, dueDate, status } = req.body;
    if (!title || !dueDate || !status) {
        res.status(400).json({ error: 'Title, due date, and status are required' });
        return;
    }
    db.run(
        'INSERT INTO tasks (title, description, due_date, status) VALUES (?, ?, ?, ?)',
        [title, description, dueDate, status],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const { title, description, dueDate, status } = req.body;
    if (!title || !dueDate || !status) {
        res.status(400).json({ error: 'Title, due date, and status are required' });
        return;
    }
    db.run(
        'UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ?',
        [title, description, dueDate, status, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(200).json({ message: 'Task updated' });
        }
    );
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Task deleted' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});