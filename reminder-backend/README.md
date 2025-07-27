# Reminder App (Backend)

This is the backend for the Reminder App, built with Node.js, Express, and SQLite. It provides a RESTful API for managing reminder data.

## 🚀 Features

* **RESTful API:** Endpoints for managing main repeating reminders and individual task reminders.
* **SQLite Database:** Stores all reminder and task data persistently in a local `.db` file.
* **CORS Enabled:** Configured to allow requests from the React frontend running on a different port.
* **Automatic Database Setup:** Creates the `reminders.db` file and necessary tables (`main_reminder`, `tasks`) if they don't exist on startup.

## 📋 Prerequisites

* **Node.js** (version 14 or higher) and **npm** installed.

## ⚙️ Setup and Running

1.  **Navigate to the backend project directory:**
    Open your terminal or command prompt and go to the `reminder-backend` folder:
    ```bash
    cd path/to/your/reminder-backend
    ```
    (e.g., `cd F:\Development\reminder-backend`)

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install `express`, `cors`, and `sqlite3`.

3.  **Start the backend server:**
    ```bash
    node server.js
    ```
    You should see output similar to this:
    ```
    Backend server running on http://localhost:3001
    Connected to the SQLite database.
    main_reminder table checked/created.
    tasks table checked/created.
    ```
    **Keep this terminal window open and running.** The frontend requires the backend to be active.

## 🗄️ Database

The application uses an SQLite database named `reminders.db`. This file will be created automatically in the `reminder-backend` directory when the server starts for the first time.

## 🔗 API Endpoints

* **`GET /api/reminders/main`**: Get the main repeating reminder settings.
* **`POST /api/reminders/main`**: Save/update the main repeating reminder settings.
* **`GET /api/tasks`**: Get all task reminders.
* **`POST /api/tasks`**: Add a new task reminder.
* **`PUT /api/tasks/:id`**: Update an existing task reminder by ID.
* **`DELETE /api/tasks/:id`**: Delete a task reminder by ID.

## ⚠️ Troubleshooting

* **"Address already in use" error:** This means another process is already using port `3001`. You might need to find and terminate that process, or change the port in `server.js`.
* **Database errors:** Ensure you have write permissions in the `reminder-backend` directory for the `reminders.db` file to be created and updated.
