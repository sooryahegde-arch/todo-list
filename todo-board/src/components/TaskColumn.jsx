import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { CircleDashed, Loader2, CheckCircle2, PauseCircle, Forward } from 'lucide-react';

const getColumnIcon = (id, color) => {
  const props = { size: 18, color };
  switch(id) {
    case 'todo': return <CircleDashed {...props} />;
    case 'inprogress': return <Loader2 {...props} />;
    case 'completed': return <CheckCircle2 {...props} />;
    case 'deferred': return <PauseCircle {...props} />;
    case 'transferred': return <Forward {...props} />;
    default: return <CircleDashed {...props} />;
  }
};

function TaskColumn({ column, tasks, onUpdateStatus, onDeleteTask, onEditTask, assignees }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onUpdateStatus(taskId, column.id);
    }
  };

  return (
    <div 
      className={`column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title">
          {getColumnIcon(column.id, column.color)}
          <span>{column.title}</span>
        </div>
        <span className="column-badge">{tasks.length}</span>
      </div>
      
      <div className="column-content">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            color={column.color}
            onDelete={() => onDeleteTask(task.id)}
            onEdit={() => onEditTask(task)}
            assignees={assignees}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskColumn;
