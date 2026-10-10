import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load initial data from localStorage if available
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskpulse_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review weekly project goals', completed: false, priority: 'High', category: 'Work' },
      { id: 2, text: 'Morning workout & stretching', completed: true, priority: 'Medium', category: 'Health' },
    ];
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('taskpulse_habits');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Drink 2L Water', streak: 5, completedToday: true },
      { id: 2, name: 'Read 20 Pages', streak: 3, completedToday: false },
      { id: 3, name: 'Meditate 10 Mins', streak: 12, completedToday: true }
    ];
  });

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' or 'break'
  const [focusSessions, setFocusSessions] = useState(0);

  // New Task Form State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [filter, setFilter] = useState('all');

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskpulse_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskpulse_habits', JSON.stringify(habits));
  }, [habits]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === 'work') {
        setFocusSessions(prev => prev + 1);
        alert('Pomodoro session completed! Take a break.');
      } else {
        alert('Break ended! Back to work.');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = (mode = timerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  // Robust Add Task Handler
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText || !newTaskText.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
    };

    // Update state and immediately clear input field
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
  };

  // Habit Handlers
  const toggleHabitToday = (id) => {
    setHabits(prevHabits => prevHabits.map(h => {
      if (h.id === id) {
        const completedToday = !h.completedToday;
        const streak = completedToday ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, completedToday, streak };
      }
      return h;
    }));
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <h2>TaskPulse</h2>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            🔥 Habits
          </button>
          <button 
            className={`nav-item ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            ⏱️ Focus Timer
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>TaskPulse v1.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">
            <span className="badge">Pro Member</span>
            <div className="avatar">JD</div>
          </div>
        </header>

        <div className="content-body">
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Task Completion</h3>
                <div className="stat-value">{progressPercentage}%</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="stat-desc">{completedCount} of {tasks.length} tasks completed</p>
              </div>

              <div className="stat-card">
                <h3>Focus Time</h3>
                <div className="stat-value">{focusSessions * 25} <span className="unit">mins</span></div>
                <p className="stat-desc">{focusSessions} completed focus sessions</p>
              </div>

              <div className="stat-card">
                <h3>Active Habits</h3>
                <div className="stat-value">{habits.filter(h => h.completedToday).length}/{habits.length}</div>
                <p className="stat-desc">Completed today</p>
              </div>

              <div className="card quick-tasks-card span-2">
                <h3>Recent Tasks</h3>
                <ul className="mini-task-list">
                  {tasks.slice(0, 4).map(t => (
                    <li key={t.id} className={t.completed ? 'completed' : ''}>
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => toggleTask(t.id)} 
                      />
                      <span>{t.text}</span>
                      <span className={`tag ${t.priority.toLowerCase()}`}>{t.priority}</span>
                    </li>
                  ))}
                  {tasks.length === 0 && <p className="empty-text">No tasks yet. Add one in the Tasks tab!</p>}
                </ul>
              </div>
            </div>
          )}

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="tasks-container">
              <form className="task-form" onSubmit={addTask}>
                <input 
                  type="text" 
                  placeholder="What needs to be done?" 
                  value={newTaskText} 
                  onChange={(e) => setNewTaskText(e.target.value)} 
                />
                <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)}>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                </select>
                <button type="submit" className="btn-primary">Add Task</button>
              </form>

              <div className="task-filters">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
                <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
              </div>

              <div className="task-list">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-left">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)} 
                      />
                      <span className="task-text">{task.text}</span>
                    </div>
                    <div className="task-right">
                      <span className="category-pill">{task.category}</span>
                      <span className={`tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <button className="btn-delete" onClick={() => deleteTask(task.id)}>×</button>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && <p className="empty-text">No tasks found.</p>}
              </div>
            </div>
          )}

          {/* HABITS VIEW */}
          {activeTab === 'habits' && (
            <div className="habits-container">
              <h2>Daily Streak Tracker</h2>
              <div className="habits-grid">
                {habits.map(habit => (
                  <div key={habit.id} className="habit-card">
                    <div className="habit-info">
                      <h4>{habit.name}</h4>
                      <p className="streak-count">🔥 {habit.streak} day streak</p>
                    </div>
                    <button 
                      className={`btn-habit ${habit.completedToday ? 'done' : ''}`}
                      onClick={() => toggleHabitToday(habit.id)}
                    >
                      {habit.completedToday ? 'Completed ✓' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMER VIEW */}
          {activeTab === 'timer' && (
            <div className="timer-container">
              <div className="timer-modes">
                <button 
                  className={timerMode === 'work' ? 'active' : ''} 
                  onClick={() => resetTimer('work')}
                >
                  Focus (25m)
                </button>
                <button 
                  className={timerMode === 'break' ? 'active' : ''} 
                  onClick={() => resetTimer('break')}
                >
                  Break (5m)
                </button>
              </div>

              <div className="timer-display">
                <h2>{formatTime(timeLeft)}</h2>
              </div>

              <div className="timer-controls">
                <button className="btn-primary lg" onClick={toggleTimer}>
                  {isRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button className="btn-secondary lg" onClick={() => resetTimer(timerMode)}>
                  Reset
                </button>
              </div>
              <p className="session-counter">Total Focus Sessions Today: <strong>{focusSessions}</strong></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}