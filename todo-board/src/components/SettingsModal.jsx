import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';

function SettingsModal({ isOpen, onClose, config, setConfig, assignees = [], setAssignees }) {
  const [activeTab, setActiveTab] = useState('work'); // 'work' or 'assignees'

  // Work Types State
  const [selectedWorkType, setSelectedWorkType] = useState(Object.keys(config)[0] || '');
  const [newWorkType, setNewWorkType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingWorkType, setEditingWorkType] = useState(null);
  const [editingWorkTypeName, setEditingWorkTypeName] = useState('');

  // Assignees State
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneeMobile, setNewAssigneeMobile] = useState('');
  const [editingAssigneeId, setEditingAssigneeId] = useState(null);
  const [editAssigneeName, setEditAssigneeName] = useState('');
  const [editAssigneeMobile, setEditAssigneeMobile] = useState('');

  if (!isOpen) return null;

  const workTypes = Object.keys(config);

  // --- Work Type Handlers ---
  const handleAddWorkType = (e) => {
    e.preventDefault();
    if (!newWorkType.trim() || config[newWorkType.trim()]) return;
    
    const newName = newWorkType.trim();
    setConfig({ ...config, [newName]: [] });
    setSelectedWorkType(newName);
    setNewWorkType('');
  };

  const handleDeleteWorkType = (wt) => {
    if (confirm(`Are you sure you want to delete the Work Type "${wt}"? This will also remove all its categories.`)) {
      const newConfig = { ...config };
      delete newConfig[wt];
      setConfig(newConfig);
      if (selectedWorkType === wt) {
        setSelectedWorkType(Object.keys(newConfig)[0] || '');
      }
    }
  };

  const handleStartEditWorkType = (wt) => {
    setEditingWorkType(wt);
    setEditingWorkTypeName(wt);
  };

  const handleSaveEditWorkType = () => {
    const newName = editingWorkTypeName.trim();
    if (!newName || newName === editingWorkType) {
      setEditingWorkType(null);
      return;
    }
    if (config[newName]) {
      alert("A Work Type with this name already exists.");
      return;
    }

    const newConfig = { ...config };
    newConfig[newName] = newConfig[editingWorkType];
    delete newConfig[editingWorkType];
    
    setConfig(newConfig);
    setEditingWorkType(null);
    if (selectedWorkType === editingWorkType) {
      setSelectedWorkType(newName);
    }
  };

  // --- Category Handlers ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !selectedWorkType) return;
    
    const catName = newCategory.trim();
    if (config[selectedWorkType].includes(catName)) return;

    setConfig({
      ...config,
      [selectedWorkType]: [...config[selectedWorkType], catName]
    });
    setNewCategory('');
  };

  const handleDeleteCategory = (cat) => {
    setConfig({
      ...config,
      [selectedWorkType]: config[selectedWorkType].filter(c => c !== cat)
    });
  };

  // --- Assignee Handlers ---
  const handleAddAssignee = (e) => {
    e.preventDefault();
    if (!newAssigneeName.trim() || !newAssigneeMobile.trim()) return;
    
    setAssignees([...assignees, { 
      id: Date.now().toString(), 
      name: newAssigneeName.trim(), 
      mobile: newAssigneeMobile.trim() 
    }]);
    setNewAssigneeName('');
    setNewAssigneeMobile('');
  };

  const handleDeleteAssignee = (id) => {
    if (confirm('Are you sure you want to delete this assignee?')) {
      setAssignees(assignees.filter(a => a.id !== id));
    }
  };

  const handleStartEditAssignee = (a) => {
    setEditingAssigneeId(a.id);
    setEditAssigneeName(a.name);
    setEditAssigneeMobile(a.mobile);
  };

  const handleSaveEditAssignee = () => {
    if (!editAssigneeName.trim() || !editAssigneeMobile.trim()) return;
    setAssignees(assignees.map(a => a.id === editingAssigneeId 
      ? { ...a, name: editAssigneeName.trim(), mobile: editAssigneeMobile.trim() } 
      : a
    ));
    setEditingAssigneeId(null);
  };

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div className="modal-header" style={{ marginBottom: '1rem' }}>
          <h2 className="modal-title">Settings Master</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'work' ? 'btn-primary' : ''}`} 
            onClick={() => setActiveTab('work')}
            style={{ flex: 1 }}
          >
            Work Types & Categories
          </button>
          <button 
            className={`btn ${activeTab === 'assignees' ? 'btn-primary' : ''}`} 
            onClick={() => setActiveTab('assignees')}
            style={{ flex: 1 }}
          >
            Work Assigned To Master
          </button>
        </div>

        {activeTab === 'work' && (
          <div className="settings-layout" style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
            {/* Left Panel: Work Types */}
            <div className="settings-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Work Types</h3>
              
              <form onSubmit={handleAddWorkType} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="New Work Type" 
                  value={newWorkType}
                  onChange={e => setNewWorkType(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                  <Plus size={20} />
                </button>
              </form>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workTypes.map(wt => (
                  <div 
                    key={wt} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: selectedWorkType === wt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedWorkType === wt ? '#6366f1' : 'transparent'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedWorkType(wt)}
                  >
                    {editingWorkType === wt ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }} onClick={e => e.stopPropagation()}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingWorkTypeName}
                          onChange={e => setEditingWorkTypeName(e.target.value)}
                          autoFocus
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                        />
                        <button className="icon-btn" onClick={handleSaveEditWorkType} style={{ color: '#10b981' }}>
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: selectedWorkType === wt ? '600' : '400', flex: 1 }}>{wt}</span>
                    )}

                    {editingWorkType !== wt && (
                      <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        <button className="icon-btn" onClick={() => handleStartEditWorkType(wt)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteWorkType(wt)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {workTypes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                    No Work Types defined.
                  </p>
                )}
              </div>
            </div>

            {/* Right Panel: Categories */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                Categories {selectedWorkType ? `for "${selectedWorkType}"` : ''}
              </h3>
              
              {selectedWorkType ? (
                <>
                  <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`New Category for ${selectedWorkType}`} 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                      <Plus size={20} />
                    </button>
                  </form>

                  <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {config[selectedWorkType].map(cat => (
                      <div 
                        key={cat} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <span>{cat}</span>
                        <button className="icon-btn danger" onClick={() => handleDeleteCategory(cat)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {config[selectedWorkType].length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                        No categories defined for this work type.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Select a Work Type to manage its categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignees' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Manage Assignees</h3>
            
            <form onSubmit={handleAddAssignee} className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Assignee Name" 
                value={newAssigneeName}
                onChange={e => setNewAssigneeName(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <input 
                type="tel" 
                className="form-input" 
                placeholder="Mobile Number (e.g. +1234567890)" 
                value={newAssigneeMobile}
                onChange={e => setNewAssigneeMobile(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={20} />
                <span>Add</span>
              </button>
            </form>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignees.map(a => (
                <div 
                  key={a.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {editingAssigneeId === a.id ? (
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }} className="form-row">
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editAssigneeName}
                        onChange={e => setEditAssigneeName(e.target.value)}
                        style={{ padding: '0.5rem', flex: 1 }}
                      />
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editAssigneeMobile}
                        onChange={e => setEditAssigneeMobile(e.target.value)}
                        style={{ padding: '0.5rem', flex: 1 }}
                      />
                      <button className="icon-btn" onClick={handleSaveEditAssignee} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Name</span>
                          <span style={{ fontWeight: '500' }}>{a.name}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Mobile Number</span>
                          <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{a.mobile}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="icon-btn" onClick={() => handleStartEditAssignee(a)} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteAssignee(a.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {assignees.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                  No assignees in the master registry. Add one above.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
