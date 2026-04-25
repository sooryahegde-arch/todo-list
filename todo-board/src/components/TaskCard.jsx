import React, { useState } from 'react';
import { Trash2, Pencil, Calendar, Clock, User, MessageCircle } from 'lucide-react';

function TaskCard({ task, color, onDelete, onEdit, assignees = [] }) {
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

  const assigneeObj = assignees.find(a => a.id === task.assignedTo || a.name === task.assignedTo);
  const assigneeName = assigneeObj ? assigneeObj.name : task.assignedTo;
  const assigneeMobile = assigneeObj ? assigneeObj.mobile : null;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!assigneeMobile) return;
    
    // Clean mobile number (remove non-digits)
    const cleanMobile = assigneeMobile.replace(/\D/g, '');
    
    const deadlineStr = task.dueDate ? `${formatDate(task.dueDate)} ${formatTime(task.dueDate)}` : 'No deadline';
    const message = `Task: ${task.title} | Deadline: ${deadlineStr}`;
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
      
      {assigneeName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.75rem' }}>
          <User size={12} />
          <span>Assigned to: {assigneeName}</span>
        </div>
      )}

      {(task.workType || task.category) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {task.workType && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>{task.workType}</span>}
          {task.category && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}>{task.category}</span>}
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
          {assigneeMobile && (
            <button className="icon-btn" onClick={handleWhatsApp} title={`WhatsApp ${assigneeName}`} style={{ color: '#25D366' }}>
              <MessageCircle size={14} />
            </button>
          )}
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
