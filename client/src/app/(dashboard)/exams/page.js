'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { PenTool, Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-main">Examinations</h2>
          <p className="text-secondary text-sm">Schedule and track academic exams</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary flex items-center" onClick={() => openModal()}>
            <Plus size={16} className="mr-2" /> Add Exam
          </button>
        )}
      </div>

      <div className="card bg-surface">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-surface/70 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-main" size={32} />
            </div>
          )}
          <table className="table w-full">
            <thead>
              <tr className="text-left">
                <th className="p-3 text-secondary">Exam Name</th>
                <th className="p-3 text-secondary">Type</th>
                <th className="p-3 text-secondary">Course & Sem</th>
                <th className="p-3 text-secondary">Academic Year</th>
                <th className="p-3 text-secondary">Start Date</th>
                <th className="p-3 text-secondary">End Date</th>
                <th className="p-3 text-secondary">Status</th>
                {user?.role === 'ADMIN' && <th className="p-3 text-secondary">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id} className="border-t border-border">
                  <td className="p-3 font-bold text-main">{exam.name}</td>
                  <td className="p-3">
                    <span className="badge badge-gray">{exam.type}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-main">{exam.course?.code || 'All Courses'}</div>
                    <div className="text-xs text-secondary">Sem {exam.semester}</div>
                  </td>
                  <td className="p-3 text-main">{exam.academicYear || exam.academic_year}</td>
                  <td className="p-3 text-main">{formatDate(exam.startDate || exam.start_date)}</td>
                  <td className="p-3 text-main">{formatDate(exam.endDate || exam.end_date)}</td>
                  <td className="p-3">
                    <span className={`badge ${statusBadge(exam.status)}`}>{exam.status}</span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary-dark font-medium text-sm flex items-center" onClick={() => openModal(exam)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="text-danger hover:text-red-700 font-medium text-sm flex items-center" onClick={() => handleDelete(exam._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {exams.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 8 : 7} className="text-center py-10 text-secondary">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <PenTool size={32} className="text-secondary opacity-50" />
                      <span>No exams scheduled.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-main">{editingId ? 'Edit Exam' : 'Create Exam'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="exam-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-1">Exam Name *</label>
                    <input type="text" name="name" defaultValue={formData.name} required className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Exam Type *</label>
                    <select name="type" defaultValue={formData.type} required className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2">
                      <option value="Mid-Term">Mid-Term</option>
                      <option value="End-Term">End-Term</option>
                      <option value="Practical">Practical</option>
                      <option value="Unit Test">Unit Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Course / Program *</label>
                    <select name="course_id" defaultValue={formData.course_id} required className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2">
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Semester *</label>
                    <input type="number" name="semester" defaultValue={formData.semester} required min="1" max="12" className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Academic Year</label>
                    <input type="text" name="academic_year" defaultValue={formData.academic_year} className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Start Date *</label>
                    <input type="date" name="start_date" defaultValue={formData.start_date} required className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">End Date *</label>
                    <input type="date" name="end_date" defaultValue={formData.end_date} required className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                    <select name="status" defaultValue={formData.status} className="form-control w-full bg-background text-main border-border rounded-md px-3 py-2">
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-surface flex justify-end space-x-3 rounded-b-xl">
              <button onClick={closeModal} type="button" className="btn btn-secondary px-4 py-2 text-main bg-background hover:bg-surface border border-border rounded-md">Cancel</button>
              <button type="submit" form="exam-form" disabled={saving} className="btn btn-primary px-4 py-2 flex items-center justify-center rounded-md text-white bg-primary hover:bg-primary-dark">
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" /> Save Exam
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
