import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { jobAPI, profileAPI } from '../../api';

const BuildLogTimeline = ({ job, isDarkMode, currentUser, onRefresh }) => {
  const [showAddLog, setShowAddLog] = useState(false);
  const [note, setNote] = useState('');
  const [progressPct, setProgressPct] = useState(job.status === 'completed' ? 100 : 50);
  const [checklistTasks, setChecklistTasks] = useState(['DB Schema & Models Setup', 'REST API Endpoint Implementation', 'UI Integration & Testing']);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const logs = job.buildLogs || [];

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profileAPI.uploadFile(formData);
      const url = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
      if (url) {
        setAttachments(prev => [...prev, { name: file.name, url }]);
        toast.success('Screenshot attached!');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      setChecklistTasks(prev => [...prev, newTaskInput.trim()]);
      setNewTaskInput('');
    }
  };

  const handleRemoveTask = (idx) => {
    setChecklistTasks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitLog = async () => {
    if (!note.trim()) {
      toast.error('Please write a brief progress update note!');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        note: note.trim(),
        progressPercentage: Number(progressPct),
        attachments,
        checklist: checklistTasks.map(t => ({ task: t, completed: false })),
      };

      await jobAPI.addBuildLog(job._id, payload);
      toast.success('Build Log entry posted successfully! Incremental trust updated.');
      setNote('');
      setAttachments([]);
      setShowAddLog(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post build log.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleChecklist = async (logId, itemIdx) => {
    try {
      await jobAPI.toggleBuildLogChecklist(job._id, logId, itemIdx);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to update task checkbox.');
    }
  };

  const themeBg = isDarkMode ? '#071422' : '#ffffff';
  const themeCardBg = isDarkMode ? '#0b1d30' : '#f8fafc';
  const themeText = isDarkMode ? '#e2e8f0' : '#0f172a';
  const themeBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <div style={{ background: themeBg, borderRadius: 14, border: `1px solid ${themeBorder}`, padding: 20, marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: themeText, display: 'flex', alignItems: 'center', gap: 8 }}>
            🏗️ Build Log & WIP Timeline
            <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 99, fontWeight: 700, border: '1px solid #a7f3d0' }}>
              Incremental Trust Active
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: 2 }}>
            Real-time work updates, screenshot proof, and task ticks visible to client.
          </div>
        </div>
        <button
          onClick={() => setShowAddLog(!showAddLog)}
          style={{
            padding: '8px 14px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {showAddLog ? 'Close Form' : '➕ Post Progress Update'}
        </button>
      </div>

      {/* Add Log Form */}
      {showAddLog && (
        <div style={{ background: themeCardBg, padding: 16, borderRadius: 12, border: `1px solid ${themeBorder}`, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: themeText, marginBottom: 10 }}>Post New Work-in-Progress Update</div>
          
          <textarea
            rows={3}
            placeholder="Write a 1-2 line note about what was completed today (e.g. Completed database schema & implemented API endpoints)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText, outline: 'none', marginBottom: 12 }}
          />

          {/* Progress Slider */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: themeText, marginBottom: 4 }}>
              <span>Overall Completion Progress</span>
              <span style={{ color: '#2563eb' }}>{progressPct}% Completed</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPct}
              onChange={(e) => setProgressPct(e.target.value)}
              style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
            />
          </div>

          {/* Dynamic Task Checklist Builder */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Sub-Tasks Checklist</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {checklistTasks.map((t, i) => (
                <span key={i} style={{ background: isDarkMode ? '#1e293b' : '#e2e8f0', color: themeText, fontSize: 12, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  [ ] {t}
                  <button onClick={() => handleRemoveTask(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add sub-task (e.g. Unit tests verified)..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                style={{ flex: 1, padding: '7px 10px', border: `1px solid ${themeBorder}`, borderRadius: 6, fontSize: 12.5, background: isDarkMode ? '#071622' : '#fff', color: themeText }}
              />
              <button onClick={handleAddTask} style={{ padding: '7px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add Task</button>
            </div>
          </div>

          {/* Screenshot Attachments */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Screenshot Proof / Attachments</label>
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {attachments.map((att, i) => (
                  <span key={i} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                    🖼️ {att.name}
                  </span>
                ))}
              </div>
            )}
            <input type="file" id="wip-file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
            <button
              type="button"
              onClick={() => document.getElementById('wip-file').click()}
              disabled={uploading}
              style={{ padding: '7px 14px', border: `1.5px dashed ${themeBorder}`, borderRadius: 6, background: 'transparent', color: themeText, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              📎 {uploading ? 'Uploading Screenshot...' : 'Attach Screenshot Proof'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setShowAddLog(false)} style={{ padding: '8px 14px', border: `1px solid ${themeBorder}`, borderRadius: 6, background: 'transparent', color: themeText, fontSize: 12.5 }}>Cancel</button>
            <button onClick={handleSubmitLog} disabled={submitting} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              {submitting ? 'Posting...' : 'Publish Update'}
            </button>
          </div>
        </div>
      )}

      {/* Timeline Feed */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 12px', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13, background: themeCardBg, borderRadius: 10, border: `1px dashed ${themeBorder}` }}>
          🚀 No build log updates posted yet. Freelancers can post daily progress notes & screenshots here to build incremental trust!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {logs.slice().reverse().map((log, idx) => (
            <div key={log._id || idx} style={{ background: themeCardBg, padding: 14, borderRadius: 10, border: `1px solid ${themeBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
                    {log.author?.firstName ? log.author.firstName[0] : 'U'}
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: themeText }}>{log.author?.firstName ? `${log.author.firstName} ${log.author.lastName || ''}` : 'Team Member'}</span>
                    <span style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#64748b', marginLeft: 8 }}>
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 99, border: '1px solid #a7f3d0' }}>
                  {log.progressPercentage}% Done
                </div>
              </div>

              {/* Note */}
              <div style={{ fontSize: 13, color: themeText, marginBottom: 10, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {log.note}
              </div>

              {/* Checklist */}
              {log.checklist && log.checklist.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, background: isDarkMode ? '#071622' : '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${themeBorder}` }}>
                  {log.checklist.map((item, iIdx) => (
                    <label key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: item.completed ? '#10b981' : themeText, textDecoration: item.completed ? 'line-through' : 'none', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(log._id, iIdx)}
                        style={{ accentColor: '#10b981', width: 15, height: 15, cursor: 'pointer' }}
                      />
                      {item.task}
                    </label>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {log.attachments && log.attachments.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {log.attachments.map((att, aIdx) => (
                    <a
                      key={aIdx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: 6, textDecoration: 'none', fontWeight: 600, border: '1px solid #bfdbfe' }}
                    >
                      🖼️ {att.name || 'View Proof'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildLogTimeline;
