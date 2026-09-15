'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { UserPlus, Edit2, Trash2, X, GraduationCap, Check } from 'lucide-react';

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (teacher = null) => {
    if (teacher) {
      setEditingId(teacher._id);
      setFormData({
        first_name: teacher.firstName,
        last_name: teacher.lastName,
        email: teacher.user?.email || '',
        phone: teacher.phone || '',
        employee_id: teacher.employeeId,
        designation: teacher.designation || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || ''
      });
    } else {
      setEditingId(null);
      setFormData({});
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
        await api.put(`/teachers/${editingId}`, data);
      } else {
        await api.post('/teachers', data);
      }
      closeModal();
      loadTeachers();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        loadTeachers();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-main tracking-tight">Teachers</h2>
          <p className="text-secondary text-sm mt-1">Manage faculty and staff</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <UserPlus size={16} className="mr-2" />
            Add Teacher
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="spinner"></div>
            </div>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="font-mono text-xs text-secondary">{teacher.employeeId}</td>
                  <td>
                    <div className="font-medium text-main">{teacher.firstName} {teacher.lastName}</div>
                    <div className="text-xs text-secondary">{teacher.qualification || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="font-medium text-main">{teacher.department?.name || '—'}</div>
                  </td>
                  <td>
                    <div className="font-medium text-main">{teacher.designation}</div>
                    <div className="text-xs text-secondary">{teacher.specialization}</div>
                  </td>
                  <td>
                    <div className="text-sm text-main">{teacher.phone || '—'}</div>
                    <div className="text-xs text-secondary truncate w-32">{teacher.user?.email}</div>
                  </td>
                  <td>{formatDate(teacher.joiningDate)}</td>
                  <td>
                    <span className={`badge ${statusBadge(teacher.status)}`}>{teacher.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 text-secondary hover:text-primary rounded-md hover:bg-blue-50 transition-colors" onClick={() => openModal(teacher)}>
                        <Edit2 size={16} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button className="p-1.5 text-secondary hover:text-danger rounded-md hover:bg-red-50 transition-colors" onClick={() => handleDelete(teacher._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-secondary">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <GraduationCap size={32} className="text-slate-300" />
                      <p>No teachers found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="text-lg font-semibold text-main">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="teacher-form" className="space-y-6" onSubmit={handleSave}>
                <div>
                  <h4 className="text-sm font-semibold text-main uppercase tracking-wider mb-4 border-b border-border pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">First Name *</label>
                      <input type="text" name="first_name" defaultValue={formData.first_name} required className="form-control text-main" />
                    </div>
                    <div>
                      <label className="form-label">Last Name *</label>
                      <input type="text" name="last_name" defaultValue={formData.last_name} required className="form-control text-main" />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input type="email" name="email" defaultValue={formData.email} required disabled={!!editingId} className="form-control text-main disabled:bg-gray-100 disabled:text-secondary disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input type="text" name="phone" defaultValue={formData.phone} className="form-control text-main" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-main uppercase tracking-wider mb-4 border-b border-border pb-2">Professional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Employee ID *</label>
                      <input type="text" name="employee_id" defaultValue={formData.employee_id} required className="form-control text-main font-mono text-sm" />
                    </div>
                    <div>
                      <label className="form-label">Designation</label>
                      <input type="text" name="designation" defaultValue={formData.designation} className="form-control text-main" />
                    </div>
                    <div>
                      <label className="form-label">Qualification</label>
                      <input type="text" name="qualification" defaultValue={formData.qualification} className="form-control text-main" />
                    </div>
                    <div>
                      <label className="form-label">Specialization</label>
                      <input type="text" name="specialization" defaultValue={formData.specialization} className="form-control text-main" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end space-x-3">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="teacher-form" disabled={saving} className="btn btn-primary flex items-center">
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2 border-2 border-white/20 border-l-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Save Teacher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
