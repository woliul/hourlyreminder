    // db.js
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');

    // Define the path to your SQLite database file.
    // It will be created in the same directory as this script if it doesn't exist.
    const DB_PATH = path.resolve(__dirname, 'reminders.db');

    // Initialize the database connection
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
            // Run migrations/table creation if the database is new or tables are missing
            db.serialize(() => {
                // Create main_reminder table
                db.run(`
                    CREATE TABLE IF NOT EXISTS main_reminder (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        message TEXT,
                        time_hour TEXT,
                        time_minute TEXT,
                        repeat_type TEXT,
                        interval INTEGER,
                        count INTEGER,
                        start_date TEXT,
                        is_active INTEGER
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating main_reminder table:', err.message);
                    } else {
                        console.log('main_reminder table checked/created.');
                        // Insert a default/initial main reminder if the table is empty
                        db.get("SELECT COUNT(*) AS count FROM main_reminder", (err, row) => {
                            if (err) {
                                console.error('Error checking main_reminder count:', err.message);
                            } else if (row.count === 0) {
                                db.run(`
                                    INSERT INTO main_reminder (message, time_hour, time_minute, repeat_type, interval, count, start_date, is_active)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    'Time for a break!', // Default message
                                    '09',                 // Default hour
                                    '00',                 // Default minute
                                    'hourly',             // Default repeat type
                                    1,                    // Default interval
                                    1,                    // Default count
                                    '',                   // Default start date (empty)
                                    0                     // Default is_active (false)
                                ], (err) => {
                                    if (err) {
                                        console.error('Error inserting default main reminder:', err.message);
                                    } else {
                                        console.log('Default main reminder inserted.');
                                    }
                                });
                            }
                        });
                    }
                });

                // Create tasks table
                db.run(`
                    CREATE TABLE IF NOT EXISTS tasks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        message TEXT NOT NULL,
                        datetime TEXT NOT NULL,
                        is_active INTEGER DEFAULT 1
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating tasks table:', err.message);
                    } else {
                        console.log('tasks table checked/created.');
                    }
                });
            });
        }
    });

    module.exports = db; // Export the database connection object
    