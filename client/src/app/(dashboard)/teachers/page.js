'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

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
          <h2 className="text-2xl font-bold text-dark">Teachers</h2>
          <p className="text-gray-500 text-sm">Manage faculty and staff</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Teacher</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
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
                  <td className="font-mono text-sm">{teacher.employeeId}</td>
                  <td>
                    <div className="font-medium text-dark">{teacher.firstName} {teacher.lastName}</div>
                    <div className="text-xs text-gray-500">{teacher.qualification || 'N/A'}</div>
                  </td>
                  <td>{teacher.department?.name || '—'}</td>
                  <td>
                    <div>{teacher.designation}</div>
                    <div className="text-xs text-gray-500">{teacher.specialization}</div>
                  </td>
                  <td>
                    <div>{teacher.phone}</div>
                    <div className="text-xs text-gray-500">{teacher.user?.email}</div>
                  </td>
                  <td>{formatDate(teacher.joiningDate)}</td>
                  <td>
                    <span className={`badge ${statusBadge(teacher.status)}`}>{teacher.status}</span>
                  </td>
                  <td>
                    <button className="text-primary hover:text-primary-dark font-medium text-sm mr-3" onClick={() => openModal(teacher)}>Edit</button>
                    {user?.role === 'ADMIN' && (
                      <button className="text-danger hover:text-red-700 font-medium text-sm" onClick={() => handleDelete(teacher._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="teacher-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input type="text" name="first_name" defaultValue={formData.first_name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input type="text" name="last_name" defaultValue={formData.last_name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input type="email" name="email" defaultValue={formData.email} required disabled={!!editingId} className="form-control disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input type="text" name="phone" defaultValue={formData.phone} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Employee ID *</label>
                    <input type="text" name="employee_id" defaultValue={formData.employee_id} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input type="text" name="designation" defaultValue={formData.designation} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Qualification</label>
                    <input type="text" name="qualification" defaultValue={formData.qualification} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Specialization</label>
                    <input type="text" name="specialization" defaultValue={formData.specialization} className="form-control" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="teacher-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
