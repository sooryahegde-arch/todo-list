import React, { useState } from 'react';
import { Trash2, Pencil, Calendar, Clock, User } from 'lucide-react';

function TaskCard({ task, color, onDelete, onEdit }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-status-indicator" style={{ backgroundColor: color }}></div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {task.description}
        </p>
      )}
      
      {task.assignedTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.75rem' }}>
          <User size={12} />
          <span>Assigned to: {task.assignedTo}</span>
        </div>
      )}

      <div className="task-meta">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div className="task-date">
            <Calendar size={12} />
            <span>{formatDate(task.date)}</span>
          </div>
          {task.dueDate && (
            <div className="task-date" style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
              <Clock size={12} />
              <span>Due: {formatDate(task.dueDate)} {formatTime(task.dueDate)}</span>
            </div>
          )}
        </div>
        
        <div className="task-actions">
          <button className="icon-btn" onClick={onEdit} title="Edit Task">
            <Pencil size={14} />
          </button>
          <button className="icon-btn danger" onClick={onDelete} title="Delete Task">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
