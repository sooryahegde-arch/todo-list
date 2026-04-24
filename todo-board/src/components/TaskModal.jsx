import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

function TaskModal({ isOpen, onClose, onSave, taskToEdit = null, workTypesConfig = {} }) {
  const workTypes = Object.keys(workTypesConfig);
  const initialWorkType = workTypes.length > 0 ? workTypes[0] : '';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [workType, setWorkType] = useState(initialWorkType);
  const [category, setCategory] = useState(initialWorkType ? (workTypesConfig[initialWorkType][0] || '') : '');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setStatus(taskToEdit.status);
        setDueDate(taskToEdit.dueDate || '');
        setAssignedTo(taskToEdit.assignedTo || '');
        
        const wt = taskToEdit.workType || initialWorkType;
        setWorkType(wt);
        const categories = workTypesConfig[wt] || [];
        setCategory(taskToEdit.category || (categories.length > 0 ? categories[0] : ''));
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setDueDate('');
        setAssignedTo('');
        setWorkType(initialWorkType);
        setCategory(initialWorkType ? (workTypesConfig[initialWorkType][0] || '') : '');
      }
    }
  }, [isOpen, taskToEdit, workTypesConfig]); // Removed initialWorkType from dependencies to avoid loop if it evaluates lazily

  const handleWorkTypeChange = (e) => {
    const newWorkType = e.target.value;
    setWorkType(newWorkType);
    setCategory(workTypesConfig[newWorkType]?.[0] || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      onSave({
        ...taskToEdit,
        title: title.trim(),
        description: description.trim(),
        status: status,
        dueDate: dueDate || null,
        assignedTo: assignedTo.trim() || null,
        workType: workType,
        category: category,
        reminded: taskToEdit.dueDate === dueDate ? taskToEdit.reminded : false, // Reset reminder if date changed
      });
    } else {
      onSave({
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        status: status,
        date: new Date().toISOString(),
        dueDate: dueDate || null,
        assignedTo: assignedTo.trim() || null,
        workType: workType,
        category: category,
        reminded: false,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Redesign landing page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="deferred">Deferred</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Deadline</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Work Type</label>
              <select 
                className="form-select"
                value={workType}
                onChange={handleWorkTypeChange}
              >
                {workTypes.map(wt => (
                  <option key={wt} value={wt}>{wt}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {(workTypesConfig[workType] || []).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Assigned To</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. John Doe"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
