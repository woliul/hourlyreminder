    // server.js
    const express = require('express');
    const cors = require('cors'); // Import cors middleware
    const db = require('./db'); // Import the database connection

    const app = express();
    const PORT = 3001; // Choose a port different from React's default (3000)

    // Middleware
    app.use(cors()); // Enable CORS for all routes
    app.use(express.json()); // Parse JSON request bodies

    // --- API Routes for Main Repeating Reminder ---

    // GET main reminder settings
    app.get('/api/reminders/main', (req, res) => {
        db.get("SELECT * FROM main_reminder WHERE id = 1", (err, row) => {
            if (err) {
                console.error('Error fetching main reminder:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            if (row) {
                // Convert is_active from integer (0/1) to boolean
                const mainReminder = {
                    message: row.message,
                    time: { hour: row.time_hour, minute: row.time_minute },
                    days: JSON.parse(row.days || '[]'), // Assuming days are stored as JSON string
                    repeatType: row.repeat_type,
                    interval: row.interval,
                    count: row.count,
                    startDate: row.start_date,
                    isActive: row.is_active === 1
                };
                res.json(mainReminder);
            } else {
                // If no main reminder exists, return a default structure
                res.json({
                    message: '',
                    time: { hour: '09', minute: '00' },
                    days: [],
                    repeatType: 'hourly',
                    interval: 1,
                    count: 1,
                    startDate: '',
                    isActive: false
                });
            }
        });
    });

    // POST/PUT to save/update main reminder settings (always ID 1)
    app.post('/api/reminders/main', (req, res) => {
        const { message, time, days, repeatType, interval, count, startDate, isActive } = req.body;

        // Convert boolean isActive to integer 0 or 1 for SQLite
        const isActiveInt = isActive ? 1 : 0;
        // Convert days array to JSON string for storage
        const daysJson = JSON.stringify(days);

        // Use INSERT OR REPLACE to ensure we always have one main reminder entry (id=1)
        const sql = `
            INSERT OR REPLACE INTO main_reminder (id, message, time_hour, time_minute, repeat_type, interval, count, start_date, is_active)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [message, time.hour, time.minute, repeatType, interval, count, startDate, isActiveInt], function(err) {
            if (err) {
                console.error('Error saving main reminder:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Main reminder saved successfully!', changes: this.changes });
        });
    });

    // --- API Routes for Task Reminders ---

    // GET all tasks
    app.get('/api/tasks', (req, res) => {
        db.all("SELECT * FROM tasks", (err, rows) => {
            if (err) {
                console.error('Error fetching tasks:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            // Convert is_active from integer (0/1) to boolean for each task
            const tasks = rows.map(row => ({
                id: row.id,
                message: row.message,
                dateTime: row.datetime,
                isActive: row.is_active === 1
            }));
            res.json(tasks);
        });
    });

    // POST a new task
    app.post('/api/tasks', (req, res) => {
        const { message, dateTime, isActive } = req.body;
        const isActiveInt = isActive ? 1 : 0; // Convert boolean to integer

        const sql = `INSERT INTO tasks (message, datetime, is_active) VALUES (?, ?, ?)`;
        db.run(sql, [message, dateTime, isActiveInt], function(err) {
            if (err) {
                console.error('Error adding task:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID, message: 'Task added successfully!' });
        });
    });

    // PUT (update) an existing task
    app.put('/api/tasks/:id', (req, res) => {
        const { id } = req.params;
        const { message, dateTime, isActive } = req.body;

        let sql = `UPDATE tasks SET `;
        const params = [];
        const updates = [];

        if (message !== undefined) {
            updates.push(`message = ?`);
            params.push(message);
        }
        if (dateTime !== undefined) {
            updates.push(`datetime = ?`);
            params.push(dateTime);
        }
        if (isActive !== undefined) {
            updates.push(`is_active = ?`);
            params.push(isActive ? 1 : 0); // Convert boolean to integer
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update.' });
        }

        sql += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error updating task:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ message: 'Task not found.' });
            } else {
                res.json({ message: 'Task updated successfully!', changes: this.changes });
            }
        });
    });

    // DELETE a task
    app.delete('/api/tasks/:id', (req, res) => {
        const { id } = req.params;
        const sql = `DELETE FROM tasks WHERE id = ?`;
        db.run(sql, id, function(err) {
            if (err) {
                console.error('Error deleting task:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ message: 'Task not found.' });
            } else {
                res.json({ message: 'Task deleted successfully!', changes: this.changes });
            }
        });
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
    