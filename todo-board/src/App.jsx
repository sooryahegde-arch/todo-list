import { useState, useEffect } from 'react';
import { PlusCircle, Kanban } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import { supabase, isSupabaseConfigured } from './supabase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const fetchTasks = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('tasks').select('*');
          if (error) throw error;
          setTasks(data || []);
        } catch (error) {
          console.error("Error fetching tasks from Supabase:", error);
          alert("Failed to load tasks from Supabase. Check your configuration.");
        }
      } else {
        // Fallback to local storage if Supabase is not configured
        const savedTasks = localStorage.getItem('todo-tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks([
            { id: '1', title: 'Plan project structure', description: 'Define the main components and state management.', status: 'todo', date: new Date().toISOString() },
            { id: '2', title: 'Design premium UI', description: 'Use dark mode and glassmorphism.', status: 'inprogress', date: new Date().toISOString() },
            { id: '3', title: 'Implement drag and drop', description: 'Add HTML5 drag and drop API for Kanban board.', status: 'todo', date: new Date().toISOString() },
          ]);
        }
      }
      setIsLoading(false);
    };

    fetchTasks();
  }, []);

  // Save to Local Storage as a fallback/cache
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Reminders
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      setTasks(currentTasks => {
        let changed = false;
        const now = new Date();
        const updatedTasks = currentTasks.map(task => {
          if (task.dueDate && !task.reminded && task.status !== 'completed') {
            const dueDate = new Date(task.dueDate);
            if (dueDate <= now) {
              changed = true;
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Task Reminder', {
                  body: `The task "${task.title}" is now due!`,
                  icon: '/vite.svg'
                });
              } else {
                alert(`Task Reminder: "${task.title}" is now due!`);
              }
              const updatedTask = { ...task, reminded: true };
              
              // If using Supabase, update the reminded status in the background
              if (isSupabaseConfigured) {
                supabase.from('tasks').update({ reminded: true }).eq('id', task.id).then();
              }
              
              return updatedTask;
            }
          }
          return task;
        });
        return changed ? updatedTasks : currentTasks;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (savedTask) => {
    // Optimistic UI update
    if (editingTask) {
      setTasks(tasks.map(task => task.id === savedTask.id ? savedTask : task));
    } else {
      setTasks([...tasks, savedTask]);
    }
    handleCloseModal();

    if (isSupabaseConfigured) {
      if (editingTask) {
        const { error } = await supabase.from('tasks').update(savedTask).eq('id', savedTask.id);
        if (error) console.error("Error updating task in Supabase:", error);
      } else {
        const { error } = await supabase.from('tasks').insert([savedTask]);
        if (error) console.error("Error inserting task into Supabase:", error);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) console.error("Error updating status in Supabase:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Optimistic UI update
    setTasks(tasks.filter(task => task.id !== taskId));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) console.error("Error deleting task in Supabase:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header animate-fade-in">
        <div className="app-title">
          <Kanban size={40} className="text-indigo-400" />
          <span>TaskFlow</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!isSupabaseConfigured && (
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>
              Local Mode (No Supabase)
            </span>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <PlusCircle size={20} />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <span style={{ color: 'var(--text-muted)' }}>Loading tasks...</span>
        </div>
      ) : (
        <main className="board-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TaskBoard 
            tasks={tasks} 
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenModal}
          />
        </main>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTask} 
        taskToEdit={editingTask}
      />
    </div>
  );
}

export default App;
