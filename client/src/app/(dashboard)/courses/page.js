'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadCourses();
    loadDepartments();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {}
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingId(course._id);
      setFormData({
        name: course.name,
        code: course.code,
        department_id: course.department?._id || '',
        duration_years: course.durationYears || 4,
        total_semesters: course.totalSemesters || 8,
        description: course.description || '',
        status: course.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ status: 'ACTIVE', duration_years: 4, total_semesters: 8 });
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
        await api.put(`/courses/${editingId}`, data);
      } else {
        await api.post('/courses', data);
      }
      closeModal();
      loadCourses();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        loadCourses();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Courses / Programs</h2>
          <p className="text-gray-500 text-sm">Manage degree programs and durations</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Course</button>
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
                <th>Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Semesters</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="font-mono text-sm font-semibold">{course.code}</td>
                  <td className="font-medium text-dark">{course.name}</td>
                  <td>{course.department?.name || '—'}</td>
                  <td>{course.durationYears} Years</td>
                  <td>{course.totalSemesters} Sems</td>
                  <td>
                    <span className={`badge ${statusBadge(course.status)}`}>{course.status}</span>
                  </td>
                  <td>
                    {user?.role === 'ADMIN' && (
                      <div className="flex space-x-3">
                        <button className="text-primary hover:text-primary-dark font-medium text-sm" onClick={() => openModal(course)}>Edit</button>
                        <button className="text-danger hover:text-red-700 font-medium text-sm" onClick={() => handleDelete(course._id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {courses.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <form id="course-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Course Name *</label>
                    <input type="text" name="name" defaultValue={formData.name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Course Code *</label>
                    <input type="text" name="code" defaultValue={formData.code} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Department *</label>
                    <select name="department_id" defaultValue={formData.department_id} required className="form-control">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Duration (Years)</label>
                    <input type="number" name="duration_years" defaultValue={formData.duration_years} min="1" max="6" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Total Semesters</label>
                    <input type="number" name="total_semesters" defaultValue={formData.total_semesters} min="1" max="12" className="form-control" />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Status</label>
                    <select name="status" defaultValue={formData.status} className="form-control">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="course-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
