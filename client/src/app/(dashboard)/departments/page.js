'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingId(dept._id);
      setFormData({
        name: dept.name,
        code: dept.code,
        hod_name: dept.hodName || '',
        description: dept.description || '',
        status: dept.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ status: 'ACTIVE' });
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
        await api.put(`/departments/${editingId}`, data);
      } else {
        await api.post('/departments', data);
      }
      closeModal();
      loadDepartments();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        loadDepartments();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Departments</h2>
          <p className="text-gray-500 text-sm">Academic divisions and HODs</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Department</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10"><div className="spinner"></div></div>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} className="card hover:shadow-md transition-shadow">
              <div className="card-header border-b-2 border-primary">
                <div>
                  <h3 className="card-title">{dept.name}</h3>
                  <p className="text-sm font-mono text-gray-500">{dept.code}</p>
                </div>
                <span className={`badge ${statusBadge(dept.status)}`}>{dept.status}</span>
              </div>
              <div className="card-body bg-gray-50/50">
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Head of Department</div>
                  <div className="font-medium text-dark">{dept.hodName || 'Not Assigned'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4 mt-4 mb-4">
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.course_count || dept.stats?.courses || 0}</div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.teacher_count || dept.stats?.teachers || 0}</div>
                    <div className="text-xs text-gray-500">Teachers</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.student_count || dept.stats?.students || 0}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium" onClick={() => openModal(dept)}>Edit</button>
                    <button className="text-danger hover:text-red-700 text-sm font-medium" onClick={() => handleDelete(dept._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {!loading && departments.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">No departments found.</div>
        )}
      </div>

      {/* Add/Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <form id="dept-form" className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="form-label">Department Name *</label>
                  <input type="text" name="name" defaultValue={formData.name} required className="form-control" />
                </div>
                <div>
                  <label className="form-label">Department Code *</label>
                  <input type="text" name="code" defaultValue={formData.code} required className="form-control" />
                </div>
                <div>
                  <label className="form-label">HOD Name</label>
                  <input type="text" name="hod_name" defaultValue={formData.hod_name} className="form-control" />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea name="description" defaultValue={formData.description} rows="2" className="form-control"></textarea>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select name="status" defaultValue={formData.status} className="form-control">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="dept-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
