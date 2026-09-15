'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Bell, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [category]);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notices${category ? `?category=${category}` : ''}`);
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (notice = null) => {
    if (notice) {
      setEditingId(notice._id);
      setFormData({
        title: notice.title,
        description: notice.description,
        category: notice.category,
        priority: notice.priority,
        target_role: notice.targetRole || 'ALL',
        expiry_date: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData({ priority: 'MEDIUM', category: 'General', target_role: 'ALL' });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, data);
      } else {
        await api.post('/notices', data);
      }
      closeModal();
      loadNotices();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        loadNotices();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-main">Notice Board</h2>
          <p className="text-secondary text-sm">Official announcements and alerts</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary flex items-center" onClick={() => openModal()}>
            <Plus size={16} className="mr-2" /> Post Notice
          </button>
        )}
      </div>

      <div className="flex space-x-2 border-b border-border pb-4">
        {['', 'Examination', 'Holiday', 'Fee', 'General', 'Event'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-surface text-secondary hover:bg-nav'}`}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-surface/70 flex items-center justify-center z-10">
            <div className="spinner"></div>
          </div>
        )}
        
        {notices.map((notice) => (
          <div key={notice._id} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className={`h-2 ${notice.priority === 'HIGH' ? 'bg-red-500' : notice.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{notice.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(notice.priority)}`}>
                  {notice.priority}
                </span>
              </div>
              <h3 className="text-lg font-bold text-main mb-2 leading-tight">{notice.title}</h3>
              <p className="text-secondary text-sm flex-1">{notice.description}</p>
              
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-secondary">
                <span>{formatDate(notice.createdAt)}</span>
                {user?.role === 'ADMIN' ? (
                  <div className="flex space-x-2">
                    <button className="text-primary hover:text-primary-dark font-medium flex items-center" onClick={() => openModal(notice)}>
                      <Edit2 size={14} className="mr-1" /> Edit
                    </button>
                    <button className="text-danger hover:text-red-700 font-medium flex items-center" onClick={() => handleDelete(notice._id)}>
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                ) : (
                  <span>By Admin</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-secondary">
            <Bell size={48} className="mb-4 text-secondary/50" />
            <p>No notices found.</p>
          </div>
        )}
      </div>
      
      {/* DSA explanation banner */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start space-x-3 mt-8">
        <span className="text-xl">🧠</span>
        <div>
          <h4 className="text-sm font-bold text-purple-900">Powered by PriorityQueue</h4>
          <p className="text-xs text-purple-700 mt-1">
            This notice board sorts announcements in real-time using a <strong>Min-Heap Priority Queue</strong> on the backend. 
            HIGH priority items are dequeued first, bypassing standard chronological sorting.
          </p>
        </div>
      </div>

      {/* Add/Edit Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-main">{editingId ? 'Edit Notice' : 'Post New Notice'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="notice-form" className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="form-label text-main block mb-1">Notice Title *</label>
                  <input type="text" name="title" defaultValue={formData.title} required className="form-control w-full" />
                </div>
                <div>
                  <label className="form-label text-main block mb-1">Description *</label>
                  <textarea name="description" defaultValue={formData.description} required rows="3" className="form-control w-full"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-main block mb-1">Category *</label>
                    <select name="category" defaultValue={formData.category} required className="form-control w-full">
                      <option value="General">General</option>
                      <option value="Examination">Examination</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Fee">Fee</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main block mb-1">Priority Level *</label>
                    <select name="priority" defaultValue={formData.priority} required className="form-control w-full">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High (Urgent)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main block mb-1">Target Audience</label>
                    <select name="target_role" defaultValue={formData.target_role} className="form-control w-full">
                      <option value="ALL">Everyone</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="TEACHER">Teachers Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main block mb-1">Expiry Date</label>
                    <input type="date" name="expiry_date" defaultValue={formData.expiry_date} className="form-control w-full" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-nav/50 flex justify-end space-x-3">
              <button onClick={closeModal} type="button" className="btn btn-secondary bg-surface text-main border border-border">Cancel</button>
              <button type="submit" form="notice-form" disabled={saving} className="btn btn-primary flex items-center">
                {saving ? 'Posting...' : <><Check size={16} className="mr-2" /> Post Notice</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
