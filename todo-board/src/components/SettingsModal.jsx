import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';

function SettingsModal({ isOpen, onClose, config, setConfig }) {
  const [selectedWorkType, setSelectedWorkType] = useState(Object.keys(config)[0] || '');
  const [newWorkType, setNewWorkType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const [editingWorkType, setEditingWorkType] = useState(null);
  const [editingWorkTypeName, setEditingWorkTypeName] = useState('');

  if (!isOpen) return null;

  const workTypes = Object.keys(config);

  // Work Type Handlers
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

  // Category Handlers
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

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Work Types & Categories</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
          {/* Left Panel: Work Types */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '2rem' }}>
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
