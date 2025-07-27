# Hourly Reminder App Setup Guide

This guide will walk you through setting up and running the Reminder App, which consists of a Node.js backend with SQLite for data persistence and a React frontend for the user interface.

## 🚀 Features

* **Main Repeating Reminder:** Set a primary reminder that can repeat hourly or on a daily interval.
* **Task Reminders:** Add specific tasks with messages and exact date/time.
* **Calendar View:** Visualize reminders on a monthly calendar, with indicators for days that have reminders.
* **Task Management:** Edit, activate/deactivate, and delete individual task reminders.
* **Data Persistence:** All reminder and task data is saved to an SQLite database on the backend.
* **Responsive UI:** Built with Bootstrap for a clean and responsive user experience.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Node.js:** Version 14 or higher (includes npm).
    * [Download Node.js](https://nodejs.org/en/download/)
* **npm (Node Package Manager):** Comes bundled with Node.js.

## 📂 Project Structure

It is crucial that your backend and frontend projects are in **separate, sibling directories**.

Your project structure should look like this (replace `your-development-folder` with your actual path, e.g., `F:\Oli\Development\`):

```

your-development-folder/
├── my-reminder-app/          \# React Frontend (UI)
│   ├── node\_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.js            \# Main React component
│   │   └── index.css         \# Main CSS file (Bootstrap directives here)
│   ├── package.json
│   └── ... (other React project files)
└── reminder-backend/         \# Node.js Backend (API & SQLite)
├── db.js                 \# SQLite database connection
├── server.js             \# Express API server
├── reminders.db          \# SQLite database file (will be created automatically)
├── package.json
└── node\_modules/

````

**If your `reminder-backend` folder is currently inside `my-reminder-app` or `my-reminder-app/src`, please move it to the same level as `my-reminder-app` before proceeding.**

## ⚙️ Setup Instructions

Follow these steps to get the Reminder App up and running.

### Step 1: Backend Setup (Node.js & SQLite)

1.  **Open a new Command Prompt or PowerShell window.**
2.  **Navigate to your backend project directory:**
    ```bash
    cd path/to/your/reminder-backend
    ```
    (Replace `path/to/your/reminder-backend` with the actual path, e.g., `cd F:\Oli\Development\reminder-backend`)
3.  **Install backend dependencies:**
    ```bash
    npm install
    ```
    This will install `express`, `cors`, and `sqlite3`.
4.  **Start the backend server:**
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
    **Keep this terminal window open and running.** The backend must be active for the frontend to communicate with it.

### Step 2: Frontend Setup (React & Bootstrap)

1.  **Open a *separate*, new Command Prompt or PowerShell window.** Do NOT close the terminal running your backend server.
2.  **Navigate to your frontend project directory:**
    ```bash
    cd path/to/your/my-reminder-app
    ```
    (Replace `path/to/your/my-reminder-app` with the actual path, e.g., `cd F:\Oli\Development\my-reminder-app`)
3.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
    This will install React and other necessary packages.
4.  **Ensure Bootstrap is correctly configured:**
    * Open `path/to/your/my-reminder-app/src/App.js`.
    * Verify that the Bootstrap CSS and JS CDN links are present in the `return` statement of the `App` component, like this:
        ```jsx
        // Inside App.js, within the return (...)
        <link href="[https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css](https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css)" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
        {/* ... other content ... */}
        <script src="[https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js](https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js)" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>
        ```
    * Open `path/to/your/my-reminder-app/src/index.css`.
    * **Ensure this file is empty.** If it contains any `@tailwind` directives or other CSS, delete them and save the file.
5.  **Start the React development server:**
    ```bash
    npm start
    ```
    This command will compile your React application and automatically open a new tab in your default web browser, usually at `http://localhost:3000`.

## 🎉 You're Done!

Your Reminder App should now be running in your browser at `http://localhost:3000`, with the backend handling data at `http://localhost:3001`.

## ⚠️ Troubleshooting

* **"Cannot GET /" when Browse `http://localhost:3001`:** This is normal! Your backend is an API server, not a web server for serving HTML pages directly. It's meant for your React frontend to communicate with.
* **"Error fetching main reminder: Failed to fetch" or similar network errors in browser console:**
    * This almost always means your **backend server is not running** or is not accessible. Go back to **Step 1** and ensure `node server.js` is running in its own terminal window and shows "Backend server running on http://localhost:3001".
    * Check your browser's **Network tab** (F12 -> Network) for requests to `http://localhost:3001`. They should show a `200 OK` status.
* **UI is unstyled (looks like plain HTML):**
    * Ensure you have correctly followed **Step 2.4** (Bootstrap CDN links in `App.js` and empty `index.css`).
    * Make sure you saved all file changes and restarted the React frontend (`npm start`).
* **Compilation Errors in React Terminal:** If you see errors like `Expected "]" but found ";"`, double-check that your `App.js` file exactly matches the latest code provided in the Canvas, especially around `useState` declarations.

## 💡 Important Notes

* **Notifications:** The current version of the app does **not** implement browser or system-level notifications. The "Overall Reminder Status" only provides a textual countdown. Implementing actual notifications would require additional development using the Web Notification API.
* **Database Location:** The `reminders.db` SQLite database file will be created in your `path/to/your/reminder-backend` directory.
