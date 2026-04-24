import React from 'react';
import TaskColumn from './TaskColumn';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'var(--status-todo)' },
  { id: 'inprogress', title: 'In Progress', color: 'var(--status-inprogress)' },
  { id: 'completed', title: 'Completed', color: 'var(--status-completed)' },
  { id: 'deferred', title: 'Deferred', color: 'var(--status-deferred)' },
  { id: 'transferred', title: 'Transferred', color: 'var(--status-transferred)' },
];

function TaskBoard({ tasks, onUpdateStatus, onDeleteTask, onEditTask, hideCompleted }) {
  const visibleColumns = hideCompleted ? COLUMNS.filter(c => c.id !== 'completed') : COLUMNS;

  return (
    <>
      {visibleColumns.map(column => (
        <TaskColumn 
          key={column.id}
          column={column}
          tasks={tasks.filter(task => task.status === column.id)}
          onUpdateStatus={onUpdateStatus}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
      ))}
    </>
  );
}

export default TaskBoard;
