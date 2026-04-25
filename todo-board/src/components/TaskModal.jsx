import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Paperclip, Loader2, Trash2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase, isSupabaseConfigured } from '../supabase';

function TaskModal({ isOpen, onClose, onSave, taskToEdit = null, workTypesConfig = {}, assignees = [] }) {
  const workTypes = Object.keys(workTypesConfig);
  const initialWorkType = workTypes.length > 0 ? workTypes[0] : '';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [workType, setWorkType] = useState(initialWorkType);
  const [category, setCategory] = useState(initialWorkType ? (workTypesConfig[initialWorkType][0] || '') : '');
  
  const [attachments, setAttachments] = useState([]); // New files to upload
  const [existingAttachments, setExistingAttachments] = useState([]); // Already uploaded files
  const [isUploading, setIsUploading] = useState(false);

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
        setExistingAttachments(taskToEdit.attachments || []);
        setAttachments([]);
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setDueDate('');
        setAssignedTo('');
        setWorkType(initialWorkType);
        setCategory(initialWorkType ? (workTypesConfig[initialWorkType][0] || '') : '');
        setExistingAttachments([]);
        setAttachments([]);
      }
    }
  }, [isOpen, taskToEdit, workTypesConfig]); // Removed initialWorkType from dependencies to avoid loop if it evaluates lazily

  const handleWorkTypeChange = (e) => {
    const newWorkType = e.target.value;
    setWorkType(newWorkType);
    setCategory(workTypesConfig[newWorkType]?.[0] || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isUploading) return;

    let finalAttachments = [...existingAttachments];

    if (attachments.length > 0) {
      if (!isSupabaseConfigured) {
        alert("Attachments are only supported when Supabase is configured. Your files will not be saved.");
      } else {
        setIsUploading(true);
        try {
          for (const file of attachments) {
            let fileToUpload = file;
            if (file.type.startsWith('image/')) {
              fileToUpload = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1920, useWebWorker: true });
            }
            
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { error: uploadError } = await supabase.storage.from('attachments').upload(fileName, fileToUpload);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(fileName);
            
            finalAttachments.push({
              id: uuidv4(),
              name: file.name,
              url: publicUrl,
              type: file.type,
              path: fileName
            });
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Some files failed to upload.");
        }
        setIsUploading(false);
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status: status,
      dueDate: dueDate || null,
      assignedTo: assignedTo.trim() || null,
      workType: workType,
      category: category,
      attachments: finalAttachments
    };

    if (taskToEdit) {
      onSave({
        ...taskToEdit,
        ...taskData,
        reminded: taskToEdit.dueDate === dueDate ? taskToEdit.reminded : false,
      });
    } else {
      onSave({
        id: uuidv4(),
        ...taskData,
        date: new Date().toISOString(),
        reminded: false,
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit
      if (validFiles.length < newFiles.length) {
        alert("Some files were skipped because they exceed the 5MB limit.");
      }
      setAttachments([...attachments, ...validFiles]);
    }
  };

  const removeNewAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (id) => {
    setExistingAttachments(existingAttachments.filter(a => a.id !== id));
    // Note: To be fully healthy for free tier, we should also delete from Supabase storage here,
    // or trigger an API call to delete it. For simplicity in UI, we just remove the reference.
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

          <div className="form-group form-row" style={{ display: 'flex', gap: '1rem' }}>
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

          <div className="form-group form-row" style={{ display: 'flex', gap: '1rem' }}>
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
            <select 
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">-- Unassigned --</option>
              {assignees.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
              {/* Fallback for legacy string assignees not in master */}
              {assignedTo && !assignees.find(a => a.id === assignedTo) && (
                <option value={assignedTo}>{assignedTo} (Legacy)</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paperclip size={16} /> Attachments {isSupabaseConfigured ? '' : '(Supabase Required)'}
            </label>
            <div style={{ padding: '1rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '0.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)' }}>
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                disabled={!isSupabaseConfigured || isUploading}
              />
              <label htmlFor="file-upload" className="btn" style={{ cursor: isSupabaseConfigured ? 'pointer' : 'not-allowed', opacity: isSupabaseConfigured ? 1 : 0.5 }}>
                Select Files (Max 5MB)
              </label>
            </div>

            {(existingAttachments.length > 0 || attachments.length > 0) && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {existingAttachments.map(file => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'none' }}>{file.name}</a>
                    </span>
                    <button type="button" className="icon-btn danger" onClick={() => removeExistingAttachment(file.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {attachments.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%', color: 'var(--text-muted)' }}>
                      {file.name} (Pending)
                    </span>
                    <button type="button" className="icon-btn danger" onClick={() => removeNewAttachment(idx)} disabled={isUploading}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim() || isUploading}>
              {isUploading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (taskToEdit ? 'Save Changes' : 'Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
