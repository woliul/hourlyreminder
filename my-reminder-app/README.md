# My Reminder App (Frontend)

This is the frontend (user interface) for the Reminder App, built with React and styled using Bootstrap. It communicates with a separate Node.js backend to manage reminder data.

## 🚀 Features

* Interactive user interface for setting and managing reminders.
* Displays a main repeating reminder and a list of individual task reminders.
* Features a calendar view to visualize reminders.
* Allows adding, editing, and deleting task reminders.

## 📋 Prerequisites

Before running this frontend, ensure you have:

* **Node.js** (version 14 or higher) and **npm** installed.
* The **Reminder App Backend** running on `http://localhost:3001`. Refer to `reminder-backend/README.md` for setup instructions.

## ⚙️ Setup and Running

1.  **Navigate to the frontend project directory:**
    Open your terminal or command prompt and go to the `my-reminder-app` folder:
    ```bash
    cd path/to/your/my-reminder-app
    ```
    (e.g., `cd F:\Oli\Development\my-reminder-app`)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the application in your default web browser at `http://localhost:3000`.

## 🎨 Styling

This project uses **Bootstrap 5.3.3** via CDN for styling. The Bootstrap CSS and JS bundles are directly included in `src/App.js`.

* `src/index.css` should be empty as all styling is handled by Bootstrap classes and custom CSS within `App.js`.

## ⚠️ Troubleshooting

* **"Error fetching..." in browser console:** This means the frontend cannot connect to the backend. Ensure your `reminder-backend` server is running on `http://localhost:3001`.
* **UI looks unstyled:** Verify that the Bootstrap CDN links are correctly placed in `src/App.js` and that `src/index.css` is empty.
* **Compilation errors:** Double-check your `src/App.js` for any syntax errors, especially around `useState` hooks.
