'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Dependencies
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadExams();
    if (user?.role === 'ADMIN') loadCourses();
  }, [user]);

  const loadExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data || []);
    } catch (err) {}
  };

  const openModal = (exam = null) => {
    if (exam) {
      setEditingId(exam._id);
      setFormData({
        name: exam.name,
        type: exam.type,
        course_id: exam.course_id || exam.course?._id || '',
        semester: exam.semester || 1,
        academic_year: exam.academicYear || exam.academic_year || '2025-26',
        start_date: exam.startDate || exam.start_date ? new Date(exam.startDate || exam.start_date).toISOString().split('T')[0] : '',
        end_date: exam.endDate || exam.end_date ? new Date(exam.endDate || exam.end_date).toISOString().split('T')[0] : '',
        status: exam.status || 'UPCOMING'
      });
    } else {
      setEditingId(null);
      setFormData({ type: 'Mid-Term', semester: 1, academic_year: '2025-26', status: 'UPCOMING' });
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
        await api.put(`/exams/${editingId}`, data);
      } else {
        await api.post('/exams', data);
      }
      closeModal();
      loadExams();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${id}`);
        loadExams();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Examinations</h2>
          <p className="text-gray-500 text-sm">Schedule and track academic exams</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Create Exam</button>
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
                <th>Exam Name</th>
                <th>Type</th>
                <th>Course & Sem</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                {user?.role === 'ADMIN' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="font-bold text-dark">{exam.name}</td>
                  <td>
                    <span className="badge badge-gray">{exam.type}</span>
                  </td>
                  <td>
                    <div>{exam.course?.code || 'All Courses'}</div>
                    <div className="text-xs text-gray-500">Sem {exam.semester}</div>
                  </td>
                  <td>{exam.academicYear || exam.academic_year}</td>
                  <td>{formatDate(exam.startDate || exam.start_date)}</td>
                  <td>{formatDate(exam.endDate || exam.end_date)}</td>
                  <td>
                    <span className={`badge ${statusBadge(exam.status)}`}>{exam.status}</span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary-dark font-medium text-sm" onClick={() => openModal(exam)}>Edit</button>
                        <button className="text-danger hover:text-red-700 font-medium text-sm" onClick={() => handleDelete(exam._id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {exams.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 8 : 7} className="text-center py-10 text-gray-500">No exams scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Edit Exam' : 'Create Exam'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <form id="exam-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Exam Name *</label>
                    <input type="text" name="name" defaultValue={formData.name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Exam Type *</label>
                    <select name="type" defaultValue={formData.type} required className="form-control">
                      <option value="Mid-Term">Mid-Term</option>
                      <option value="End-Term">End-Term</option>
                      <option value="Practical">Practical</option>
                      <option value="Unit Test">Unit Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Course / Program *</label>
                    <select name="course_id" defaultValue={formData.course_id} required className="form-control">
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Semester *</label>
                    <input type="number" name="semester" defaultValue={formData.semester} required min="1" max="12" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Academic Year</label>
                    <input type="text" name="academic_year" defaultValue={formData.academic_year} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Start Date *</label>
                    <input type="date" name="start_date" defaultValue={formData.start_date} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">End Date *</label>
                    <input type="date" name="end_date" defaultValue={formData.end_date} required className="form-control" />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Status</label>
                    <select name="status" defaultValue={formData.status} className="form-control">
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="exam-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
