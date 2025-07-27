import React, { useState, useEffect, useCallback } from 'react';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:3001/api';

// ConfirmationModal Component
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-3 shadow-lg">
                    <div className="modal-body p-4 text-center">
                        <p className="lead mb-4">{message}</p>
                        <div className="d-flex justify-content-center">
                            <button
                                onClick={onConfirm}
                                className="btn btn-danger me-2 rounded-pill shadow-sm"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={onCancel}
                                className="btn btn-secondary rounded-pill shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// EditTaskModal Component
const EditTaskModal = ({ isOpen, task, onSave, onClose }) => {
    const [editedMessage, setEditedMessage] = useState('');
    const [editedDateTime, setEditedDateTime] = useState('');

    // Effect to populate form fields when the modal opens or task changes
    useEffect(() => {
        if (isOpen && task) {
            setEditedMessage(task.message || '');
            // Convert ISO string to YYYY-MM-DDTHH:MM format for datetime-local input
            setEditedDateTime(task.originalDateTime ? new Date(task.originalDateTime).toISOString().substring(0, 16) : '');
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    // Handle form submission for saving changes
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editedMessage || !editedDateTime) {
            console.error("Task message and Date/Time cannot be empty.");
            // In a real app, you'd show a user-friendly error message here
            return;
        }
        onSave(task.id, {
            message: editedMessage,
            dateTime: new Date(editedDateTime).toISOString(),
        });
        onClose(); // Close the modal after saving
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-3 shadow-lg">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Task</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="editMessage" className="form-label">Task Message:</label>
                                <input
                                    type="text"
                                    id="editMessage"
                                    className="form-control rounded-pill"
                                    value={editedMessage}
                                    onChange={(e) => setEditedMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="editDateTime" className="form-label">Date and Time:</label>
                                <input
                                    type="datetime-local"
                                    id="editDateTime"
                                    className="form-control rounded-pill"
                                    value={editedDateTime}
                                    onChange={(e) => setEditedDateTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary rounded-pill shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary rounded-pill shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


function App() {
    // Main Repeating Reminder states
    const [mainReminderMessage, setMainReminderMessage] = useState('');
    const [mainReminderTime, setMainReminderTime] = useState({ hour: '09', minute: '00' });
    const [mainReminderDays, setMainReminderDays] = useState([]);
    const [mainReminderRepeatType, setMainReminderRepeatType] = useState('hourly');
    const [mainReminderInterval, setMainReminderInterval] = useState(1);
    const [mainReminderCount, setMainReminderCount] = useState(1);
    const [mainReminderStartDate, setMainReminderStartDate] = useState('');
    const [isMainReminderActive, setIsMainReminderActive] = useState(false);

    // Task Reminder states
    const [tasks, setTasks] = useState([]);
    const [newTaskMessage, setNewTaskMessage] = useState('');
    const [newTaskDateTime, setNewTaskDateTime] = useState('');

    // Calendar states
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentMonthYear] = useState(new Date().getFullYear());
    const [selectedDayReminders, setSelectedDayReminders] = useState([]);
    const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);

    // Overall Status state
    const [nextReminderCountdown, setNextReminderCountdown] = useState('No upcoming reminders');

    // Modals states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalOnConfirm, setConfirmModalOnConfirm] = useState(() => () => {});
    const [confirmModalOnCancel, setConfirmModalOnCancel] = useState(() => () => {});

    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    // Array of month names for calendar display
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    // Array of day names for calendar display and main reminder day selection
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // --- Data Fetching from Backend ---

    // Function to fetch main reminder settings
    const fetchMainReminder = useCallback(async () => {
        console.log("Attempting to fetch main reminder from:", `${API_BASE_URL}/reminders/main`);
        try {
            const response = await fetch(`${API_BASE_URL}/reminders/main`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Main reminder fetched successfully:", data);
            // Update state with fetched main reminder data
            setMainReminderMessage(data.message || '');
            setMainReminderTime(data.time || { hour: '09', minute: '00' });
            setMainReminderDays(data.days || []);
            setMainReminderRepeatType(data.repeatType || 'hourly');
            setMainReminderInterval(data.interval || 1);
            setMainReminderCount(data.count || 1);
            setMainReminderStartDate(data.startDate || '');
            setIsMainReminderActive(data.isActive || false);
        } catch (error) {
            console.error("Error fetching main reminder:", error);
            // Optionally set default states if fetch fails
        }
    }, []);

    // Function to fetch all tasks
    const fetchTasks = useCallback(async () => {
        console.log("Attempting to fetch tasks from:", `${API_BASE_URL}/tasks`);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Tasks fetched successfully:", data);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setTasks([]); // Clear tasks if fetch fails
        }
    }, []);

    // Initial data load on component mount
    useEffect(() => {
        fetchMainReminder();
        fetchTasks();
    }, [fetchMainReminder, fetchTasks]);

    // --- Main Reminder Logic ---

    // Function to save or update the main reminder settings in backend
    const handleSaveMainReminder = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reminders/main`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: mainReminderMessage,
                    time: mainReminderTime,
                    days: mainReminderDays,
                    repeatType: mainReminderRepeatType,
                    interval: mainReminderInterval,
                    count: mainReminderCount,
                    startDate: mainReminderStartDate,
                    isActive: isMainReminderActive,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Main reminder saved successfully!");
            fetchMainReminder(); // Re-fetch to ensure UI is in sync
        } catch (e) {
            console.error("Error saving main reminder: ", e);
        }
    };

    // Toggle the active status of the main reminder
    const handleToggleMainReminder = () => {
        setIsMainReminderActive(prev => !prev);
        // The change will be saved when the 'Save Settings' button is clicked.
    };

    // --- Task Reminder Logic ---

    // Function to add a new task reminder to backend
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskMessage || !newTaskDateTime) {
            console.error("Missing task details.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: newTaskMessage,
                    dateTime: new Date(newTaskDateTime).toISOString(),
                    isActive: true,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setNewTaskMessage('');
            setNewTaskDateTime('');
            console.log("Task added successfully!");
            fetchTasks(); // Re-fetch tasks to update the list
        } catch (e) {
            console.error("Error adding task: ", e);
        }
    };

    // Function to update an existing task in backend
    const handleUpdateTask = async (taskId, updatedFields) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFields),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Task updated successfully!");
            fetchTasks(); // Re-fetch tasks to update the list
        } catch (e) {
            console.error("Error updating task: ", e);
        }
    };

    // Function to delete a task from backend
    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Task deleted successfully!");
            fetchTasks(); // Re-fetch tasks to update the list
        } catch (e) {
            console.error("Error deleting task: ", e);
        }
    };

    // Helper to check if a date is an active day for the main reminder based on interval
    const isMainReminderActiveDay = useCallback((dateToCheck) => {
        if (!isMainReminderActive || mainReminderRepeatType !== 'daily_interval' || !mainReminderStartDate) {
            return false;
        }

        const start = new Date(mainReminderStartDate);
        // Normalize dates to start of day to ensure accurate day difference calculation
        start.setHours(0, 0, 0, 0);
        dateToCheck.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(dateToCheck.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // For 'daily_interval', only check if it falls on the interval
        return (diffDays % mainReminderInterval === 0);
    }, [isMainReminderActive, mainReminderRepeatType, mainReminderStartDate, mainReminderInterval]);


    // --- Overall Countdown Logic ---

    // Callback function to calculate the next earliest reminder
    const calculateNextReminder = useCallback(() => {
        let earliestNextReminderTime = Infinity;

        const now = new Date(); // Current time

        // 1. Check Main Repeating Reminder
        if (isMainReminderActive && mainReminderMessage && mainReminderTime) {
            const { hour, minute } = mainReminderTime;
            const targetHour = parseInt(hour, 10);
            const targetMinute = parseInt(minute, 10);

            if (mainReminderRepeatType === 'hourly') {
                let nextTrigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), targetMinute, 0);
                if (nextTrigger.getTime() <= now.getTime()) {
                    nextTrigger.setHours(nextTrigger.getHours() + 1);
                }
                if (nextTrigger.getTime() < earliestNextReminderTime) {
                    earliestNextReminderTime = nextTrigger.getTime();
                }
            } else if (mainReminderRepeatType === 'daily_interval' && mainReminderStartDate) {
                for (let i = 0; i < 365; i++) {
                    const checkDate = new Date(now);
                    checkDate.setDate(now.getDate() + i);

                    if (isMainReminderActiveDay(checkDate)) {
                        const { hour, minute } = mainReminderTime;
                        const targetHour = parseInt(hour, 10);
                        const targetMinute = parseInt(minute, 10);

                        for (let j = 0; j < mainReminderCount; j++) {
                            const reminderTime = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), targetHour + j, targetMinute, 0);

                            if (reminderTime.getTime() > now.getTime() && reminderTime.getTime() < earliestNextReminderTime) {
                                earliestNextReminderTime = reminderTime.getTime();
                            }
                        }
                        if (earliestNextReminderTime !== Infinity && earliestNextReminderTime < new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1, 0, 0, 0).getTime()) {
                            break;
                        }
                    }
                }
            }
        }

        // 2. Check Task Reminders
        tasks.forEach(task => {
            if (task.isActive && task.dateTime) {
                const taskDate = new Date(task.dateTime);
                if (taskDate.getTime() > now.getTime() && taskDate.getTime() < earliestNextReminderTime) {
                    earliestNextReminderTime = taskDate.getTime();
                }
            }
        });

        // Update the countdown display string
        if (earliestNextReminderTime === Infinity) {
            setNextReminderCountdown('No upcoming reminders');
        } else {
            const timeLeft = earliestNextReminderTime - now.getTime();
            if (timeLeft <= 0) {
                setNextReminderCountdown('Reminder triggered! Recalculating...');
                setTimeout(calculateNextReminder, 1000);
            } else {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                let countdownString = `Next reminder in: `;
                if (days > 0) countdownString += `${days}d `;
                if (hours > 0 || days > 0) countdownString += `${hours}h `;
                if (minutes > 0 || hours > 0 || days > 0) countdownString += `${minutes}m `;
                countdownString += `${seconds}s`;
                setNextReminderCountdown(countdownString);
            }
        }
    }, [isMainReminderActive, mainReminderMessage, mainReminderTime, mainReminderRepeatType, mainReminderStartDate, mainReminderCount, tasks, isMainReminderActiveDay]);

    // Effect to update the countdown every second
    useEffect(() => {
        const countdownInterval = setInterval(calculateNextReminder, 1000);
        return () => clearInterval(countdownInterval);
    }, [calculateNextReminder]);

    // --- Calendar Logic ---

    // Helper function to get all days in a given month and year
    const getDaysInMonth = (month, year) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    // Helper function to get the string name of the day of the week
    const getDayOfWeek = (date) => {
        return dayNames[date.getDay()];
    };

    // Function to render the calendar grid days
    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        const calendarCells = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            // Use Bootstrap's col class for empty cells to maintain grid structure
            calendarCells.push(<div key={`empty-${i}`} className="col calendar-day-cell empty-cell"></div>);
        }

        daysInMonth.forEach((day) => {
            const dayNum = day.getDate();
            const isToday = day.toDateString() === new Date().toDateString();

            let hasMainReminder = false;
            if (isMainReminderActive) {
                if (mainReminderRepeatType === 'hourly') {
                    const dayOfWeek = getDayOfWeek(day);
                    hasMainReminder = mainReminderDays.includes(dayOfWeek);
                } else if (mainReminderRepeatType === 'daily_interval' && isMainReminderActiveDay(day)) {
                    hasMainReminder = true;
                }
            }

            const hasTaskReminder = tasks.some(task => {
                const taskDate = new Date(task.dateTime);
                return task.isActive &&
                    taskDate.getDate() === day.getDate() &&
                    taskDate.getMonth() === day.getMonth() &&
                    taskDate.getFullYear() === day.getFullYear();
            });

            // Apply custom calendar day cell classes
            const dayClasses = `col calendar-day-cell ${isToday ? 'is-today' : ''} ${
                (hasMainReminder || hasTaskReminder) ? 'has-reminder' : ''
            }`;

            calendarCells.push(
                <div
                    key={day.toISOString()}
                    className={dayClasses}
                    onClick={() => handleDayClick(day)}
                >
                    <span className="calendar-day-number">{dayNum}</span>
                    <div className="calendar-indicator">
                        {hasMainReminder && <i className="fas fa-redo" title="Main Reminder"></i>}
                        {hasTaskReminder && <i className="fas fa-clipboard-list" title="Task Reminder"></i>}
                    </div>
                </div>
            );
        });

        return calendarCells;
    };

    // Handle click on a calendar day to show its reminders in a modal
    const handleDayClick = (date) => {
        setSelectedDayDate(date);

        const remindersForDay = [];

        if (isMainReminderActive) {
            if (mainReminderRepeatType === 'hourly') {
                const dayOfWeek = getDayOfWeek(date);
                if (mainReminderDays.includes(dayOfWeek)) {
                    remindersForDay.push({
                        type: 'main',
                        message: mainReminderMessage,
                        time: `Every hour at ${mainReminderTime.minute.padStart(2, '0')} past the hour`,
                    });
                }
            } else if (mainReminderRepeatType === 'daily_interval' && isMainReminderActiveDay(date)) {
                const { hour, minute } = mainReminderTime;
                const targetHour = parseInt(hour, 10);
                const targetMinute = parseInt(minute, 10);

                for (let j = 0; j < mainReminderCount; j++) {
                    const reminderTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), targetHour + j, targetMinute, 0);
                    remindersForDay.push({
                        type: 'main',
                        message: mainReminderMessage,
                        time: reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    });
                }
            }
        }


        tasks.forEach(task => {
            const taskDate = new Date(task.dateTime);
            if (task.isActive &&
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()) {
                remindersForDay.push({
                    type: 'task',
                    id: task.id,
                    message: task.message,
                    time: taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    originalDateTime: task.dateTime
                });
            }
        });

        remindersForDay.sort((a, b) => {
            const timeA = a.type === 'main' && a.time.includes('Every hour')
                ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(mainReminderTime.hour), parseInt(mainReminderTime.minute))
                : new Date(date.toDateString() + ' ' + a.time);
            const timeB = b.type === 'main' && b.time.includes('Every hour')
                ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(mainReminderTime.hour), parseInt(mainReminderTime.minute))
                : new Date(date.toDateString() + ' ' + b.time);
            return timeA.getTime() - timeB.getTime();
        });


        setSelectedDayReminders(remindersForDay);
        setShowDayDetailsModal(true);
    };

    // Close the day details modal
    const handleCloseDayDetailsModal = () => {
        setShowDayDetailsModal(false);
        setSelectedDayReminders([]);
        setSelectedDayDate(null);
    };

    // Navigate to the previous month in the calendar
    const handlePreviousMonth = () => {
        setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
        if (currentMonth === 0) setCurrentMonthYear(prevYear => prevYear - 1);
    };

    // Navigate to the next month in the calendar
    const handleNextMonth = () => {
        setCurrentMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
        if (currentMonth === 11) setCurrentMonthYear(prevYear => prevYear + 1);
    };

    // --- Render JSX (UI) ---
    return (
        <div className="bg-light min-vh-100 p-4">
            {/* Bootstrap CSS CDN */}
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
            {/* Font Awesome CDN for icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" xintegrity="sha512-..." crossOrigin="anonymous" referrerPolicy="no-referrer" />
            {/* Inter font from Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* Custom CSS for scrollbar, font, and calendar */}
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                /* Custom CSS for calendar colors and layout */
                :root {
                    --calendar-border: #e0e0e0;
                    --calendar-bg-light: #f8f9fa;
                    --calendar-bg-today: #e0f7fa; /* Light cyan for today */
                    --calendar-text-today: #00796b; /* Darker teal for today's text */
                    --calendar-bg-reminder: #e8f5e9; /* Light green for days with reminders */
                    --calendar-text-reminder: #2e7d32; /* Darker green for reminder text */
                    --calendar-bg-hover: #f0f0f0;
                    --calendar-day-height: 100px; /* Fixed height for calendar cells */
                }

                .calendar-grid-container {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr); /* Explicitly 7 columns */
                    gap: 1px; /* Very small gap between cells */
                    border: 1px solid var(--calendar-border);
                    border-radius: 8px;
                    overflow: hidden; /* Ensures rounded corners apply to the whole grid */
                }

                .calendar-day-cell {
                    height: var(--calendar-day-height); /* Fixed height for consistency */
                    border: 1px solid var(--calendar-border);
                    background-color: var(--calendar-bg-light);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between; /* Space out content vertically */
                    align-items: flex-start; /* Align content to top-left */
                    padding: 8px; /* Padding inside each cell */
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
                    position: relative; /* For absolute positioning of indicators */
                }

                .calendar-day-cell.empty-cell {
                    background-color: #f0f0f0; /* Slightly different background for empty cells */
                    cursor: default;
                }

                .calendar-day-cell:not(.empty-cell):hover {
                    background-color: var(--calendar-bg-hover);
                }

                .calendar-day-cell.is-today {
                    background-color: var(--calendar-bg-today);
                    color: var(--calendar-text-today);
                    border-color: var(--calendar-text-today);
                }

                .calendar-day-cell.has-reminder {
                    background-color: var(--calendar-bg-reminder);
                    color: var(--calendar-text-reminder);
                }

                .calendar-day-number {
                    font-size: 1.1rem;
                    font-weight: 500;
                    align-self: flex-end; /* Align number to top-right */
                }

                .calendar-indicator {
                    font-size: 0.75rem; /* Smaller icons */
                    align-self: flex-start; /* Align indicators to bottom-left */
                    display: flex;
                    gap: 4px; /* Space between icons */
                    position: absolute; /* Position relative to parent cell */
                    bottom: 8px; /* From bottom edge */
                    left: 8px; /* From left edge */
                }

                /* Specific styling for calendar header days */
                .calendar-header-day-names {
                    display: grid; /* Use grid for header as well */
                    grid-template-columns: repeat(7, 1fr); /* Explicitly 7 columns */
                    gap: 1px; /* Match gap with calendar grid */
                    margin-bottom: 2px; /* Small space between header and grid */
                }

                .calendar-header-day {
                    padding: 8px;
                    text-align: center;
                    font-weight: bold;
                    color: #6c757d; /* Bootstrap muted text color */
                    background-color: #e9ecef; /* Light grey background for header */
                    border: 1px solid var(--calendar-border);
                    border-radius: 4px; /* Slightly rounded corners for header days */
                }
                `}
            </style>

            <div className="container bg-white p-4 rounded-3 shadow-lg">
                <h1 className="text-center text-primary mb-4">Reminder App</h1>

                {/* Overall Reminder Status Section */}
                <div className="bg-info-subtle p-3 rounded-3 shadow-sm mb-4 text-center">
                    <h2 className="fs-4 text-info mb-2">Overall Reminder Status</h2>
                    <p className="fs-5 fw-bold text-info">{nextReminderCountdown}</p>
                </div>

                <div className="row g-4">
                    {/* Main Repeating Reminder Section */}
                    <div className="col-12 col-lg-6">
                        <div className="bg-purple-light p-4 rounded-3 shadow-sm">
                            <h2 className="fs-4 text-indigo mb-3 d-flex align-items-center">
                                <i className="fas fa-redo me-3 fs-3"></i> Main Repeating Reminder
                            </h2>
                            <div className="mb-3">
                                <label htmlFor="mainMessage" className="form-label">Reminder Message:</label>
                                <input
                                    type="text"
                                    id="mainMessage"
                                    className="form-control rounded-pill"
                                    value={mainReminderMessage}
                                    onChange={(e) => setMainReminderMessage(e.target.value)}
                                    placeholder="e.g., Time for a break!"
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-6">
                                    <label htmlFor="mainTimeHour" className="form-label">Time:</label>
                                    <div className="d-flex">
                                        <select
                                            id="mainTimeHour"
                                            className="form-select rounded-pill me-2"
                                            value={mainReminderTime.hour}
                                            onChange={(e) => setMainReminderTime(prev => ({ ...prev, hour: e.target.value }))}
                                        >
                                            {[...Array(24).keys()].map(h => (
                                                <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <select
                                            id="mainTimeMinute"
                                            className="form-select rounded-pill"
                                            value={mainReminderTime.minute}
                                            onChange={(e) => setMainReminderTime(prev => ({ ...prev, minute: e.target.value }))}
                                        >
                                            {[...Array(60).keys()].map(m => (
                                                <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Repeat Type:</label>
                                    <div className="d-flex align-items-center h-100">
                                        <div className="form-check me-3">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="repeatType"
                                                value="hourly"
                                                checked={mainReminderRepeatType === 'hourly'}
                                                onChange={() => setMainReminderRepeatType('hourly')}
                                                id="repeatHourly"
                                            />
                                            <label className="form-check-label" htmlFor="repeatHourly">Hourly</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="repeatType"
                                                value="daily_interval"
                                                checked={mainReminderRepeatType === 'daily_interval'}
                                                onChange={() => setMainReminderRepeatType('daily_interval')}
                                                id="repeatDailyInterval"
                                            />
                                            <label className="form-check-label" htmlFor="repeatDailyInterval">Repeat Days</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional rendering for daily interval options */}
                            {mainReminderRepeatType === 'daily_interval' && (
                                <div className="mb-3">
                                    <div className="row g-3 align-items-center">
                                        <div className="col-auto">
                                            <label htmlFor="dailyInterval" className="form-label">Every X Days:</label>
                                            <input
                                                type="number"
                                                id="dailyInterval"
                                                className="form-control rounded-pill text-center"
                                                value={mainReminderInterval}
                                                onChange={(e) => setMainReminderInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                                min="1"
                                                style={{ width: '80px' }}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <label htmlFor="dailyCount" className="form-label">Y Times (on active day):</label>
                                            <input
                                                type="number"
                                                id="dailyCount"
                                                className="form-control rounded-pill text-center"
                                                value={mainReminderCount}
                                                onChange={(e) => setMainReminderCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                                min="1"
                                                style={{ width: '80px' }}
                                            />
                                        </div>
                                        <div className="col">
                                            <label htmlFor="mainReminderStartDate" className="form-label">Start Date:</label>
                                            <input
                                                type="date"
                                                id="mainReminderStartDate"
                                                className="form-control rounded-pill"
                                                value={mainReminderStartDate}
                                                onChange={(e) => setMainReminderStartDate(e.target.value)}
                                                required={mainReminderRepeatType === 'daily_interval'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {mainReminderRepeatType === 'hourly' && (
                                <div className="mb-3">
                                    <label className="form-label">Days of Week (for Hourly):</label>
                                    <div className="row g-2">
                                        {dayNames.map(day => (
                                            <div key={day} className="col-4 col-sm-3 col-md-auto">
                                                <div className="form-check form-check-inline bg-white p-2 rounded-pill shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        value={day}
                                                        checked={mainReminderDays.includes(day)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setMainReminderDays([...mainReminderDays, day]);
                                                            } else {
                                                                setMainReminderDays(mainReminderDays.filter(d => d !== day));
                                                            }
                                                        }}
                                                        id={`day-${day}`}
                                                    />
                                                    <label className="form-check-label" htmlFor={`day-${day}`}>{day.substring(0, 3)}</label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                <button
                                    onClick={handleSaveMainReminder}
                                    className="btn btn-primary btn-lg flex-grow-1 rounded-pill shadow-sm"
                                >
                                    Save Settings
                                </button>
                                <button
                                    onClick={handleToggleMainReminder}
                                    className={`btn btn-lg flex-grow-1 rounded-pill shadow-sm ${isMainReminderActive ? 'btn-danger' : 'btn-success'}`}
                                >
                                    {isMainReminderActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Task Reminders Section */}
                    <div className="col-12 col-lg-6">
                        <div className="bg-blue-light p-4 rounded-3 shadow-sm">
                            <h2 className="fs-4 text-cyan mb-3 d-flex align-items-center">
                                <i className="fas fa-clipboard-list me-3 fs-3"></i> Task Reminders
                            </h2>

                            {/* Form to add new tasks */}
                            <form onSubmit={handleAddTask} className="mb-4 p-3 bg-light rounded-3 shadow-sm">
                                <h3 className="fs-5 text-blue mb-3">Add New Task</h3>
                                <div className="mb-3">
                                    <label htmlFor="newTaskMessage" className="form-label">Task Message:</label>
                                    <input
                                        type="text"
                                        id="newTaskMessage"
                                        className="form-control rounded-pill"
                                        value={newTaskMessage}
                                        onChange={(e) => setNewTaskMessage(e.target.value)}
                                        placeholder="e.g., Call mom"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="newTaskDateTime" className="form-label">Date and Time:</label>
                                    <input
                                        type="datetime-local"
                                        id="newTaskDateTime"
                                        className="form-control rounded-pill"
                                        value={newTaskDateTime}
                                        onChange={(e) => setNewTaskDateTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill shadow-sm"
                                >
                                    Add Task
                                </button>
                            </form>

                            {/* List of existing tasks */}
                            <div>
                                <h3 className="fs-5 text-cyan mb-3">Your Tasks ({tasks.length})</h3>
                                {tasks.length === 0 ? (
                                    <p className="text-muted text-center py-3">No tasks added yet.</p>
                                ) : (
                                    <ul className="list-unstyled space-y-3 custom-scrollbar pe-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                        {tasks.map(task => (
                                            <li key={task.id} className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 shadow-sm border">
                                                <div>
                                                    <p className="fw-medium mb-0">{task.message}</p>
                                                    <p className="text-muted small mb-0">
                                                        {new Date(task.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                                <div className="d-flex">
                                                    <button
                                                        onClick={() => handleUpdateTask(task.id, { isActive: !task.isActive })}
                                                        className={`btn btn-sm rounded-circle me-2 ${task.isActive ? 'btn-warning' : 'btn-secondary'}`}
                                                        title={task.isActive ? 'Deactivate Task' : 'Activate Task'}
                                                    >
                                                        <i className={`fas ${task.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTaskToEdit(task);
                                                            setShowEditTaskModal(true);
                                                        }}
                                                        className="btn btn-sm btn-info rounded-circle me-2"
                                                        title="Edit Task"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModalMessage("Are you sure you want to delete this task?");
                                                            setConfirmModalOnConfirm(() => async () => {
                                                                await handleDeleteTask(task.id);
                                                                setShowConfirmModal(false);
                                                            });
                                                            setConfirmModalOnCancel(() => () => setShowConfirmModal(false));
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="btn btn-sm btn-danger rounded-circle"
                                                        title="Delete Task"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar View Section */}
                <div className="mt-4 bg-green-light p-4 rounded-3 shadow-sm">
                    <h2 className="fs-4 text-teal mb-3 d-flex align-items-center">
                        <i className="fas fa-calendar-alt me-3 fs-3"></i> Calendar View
                    </h2>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button
                            onClick={handlePreviousMonth}
                            className="btn btn-outline-teal rounded-circle shadow-sm"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h3 className="fs-5 fw-bold text-teal">
                            {monthNames[currentMonth]} {currentYear}
                        </h3>
                        <button
                            onClick={handleNextMonth}
                            className="btn btn-outline-teal rounded-circle shadow-sm"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    {/* Day names header for calendar */}
                    <div className="calendar-header-day-names">
                        {dayNames.map(day => <div key={day} className="calendar-header-day">{day.substring(0, 3)}</div>)}
                    </div>
                    {/* Calendar grid */}
                    <div className="calendar-grid-container">
                        {renderCalendarDays()}
                    </div>
                </div>

                {/* Day Details Modal (shows reminders for a clicked calendar day) */}
                {showDayDetailsModal && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-3 shadow-lg">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reminders for {selectedDayDate?.toLocaleDateString()}</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseDayDetailsModal}></button>
                                </div>
                                <div className="modal-body">
                                    {selectedDayReminders.length === 0 ? (
                                        <p className="text-muted">No reminders scheduled for this day.</p>
                                    ) : (
                                        <ul className="list-unstyled space-y-3 custom-scrollbar pe-2" style={{ maxHeight: '384px', overflowY: 'auto' }}>
                                            {selectedDayReminders.map((reminder, index) => (
                                                <li key={index} className="bg-light p-3 rounded-3 shadow-sm border d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <p className="fw-medium mb-0">
                                                            {reminder.message}
                                                            {reminder.type === 'main' && <span className="badge bg-purple-subtle text-purple ms-2">Main Reminder</span>}
                                                        </p>
                                                        <p className="text-muted small mb-0">{reminder.time}</p>
                                                    </div>
                                                    {reminder.type === 'task' && (
                                                        <div className="d-flex">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setTaskToEdit(reminder);
                                                                    setShowEditTaskModal(true);
                                                                }}
                                                                className="btn btn-sm btn-link text-info p-0 me-2" // Changed to btn-link for subtle look
                                                                title="Edit Task"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmModalMessage("Are you sure you want to delete this task?");
                                                                    setConfirmModalOnConfirm(() => async () => {
                                                                        await handleDeleteTask(reminder.id);
                                                                        setShowConfirmModal(false);
                                                                        handleCloseDayDetailsModal();
                                                                        setTimeout(() => handleDayClick(selectedDayDate), 300);
                                                                    });
                                                                    setConfirmModalOnCancel(() => () => setShowConfirmModal(false));
                                                                    setShowConfirmModal(true);
                                                                }}
                                                                className="btn btn-sm btn-link text-danger p-0" // Changed to btn-link for subtle look
                                                                title="Delete Task"
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal (for delete actions) */}
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    message={confirmModalMessage}
                    onConfirm={confirmModalOnConfirm}
                    onCancel={confirmModalOnCancel}
                />

                {/* Edit Task Modal */}
                <EditTaskModal
                    isOpen={showEditTaskModal}
                    task={taskToEdit}
                    onSave={(id, fields) => {
                        handleUpdateTask(id, fields);
                        if (showDayDetailsModal && selectedDayDate) {
                            setTimeout(() => handleDayClick(selectedDayDate), 300);
                        }
                    }}
                    onClose={() => setShowEditTaskModal(false)}
                />
            </div>
            {/* Bootstrap JS Bundle (includes Popper) */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" xintegrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous"></script>
        </div>
    );
}

export default App;
