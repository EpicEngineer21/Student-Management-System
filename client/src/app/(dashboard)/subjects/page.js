'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { BookMarked, Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Dependency Data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadSubjects();
    loadDependencies();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [dRes, cRes, tRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/teachers')
      ]);
      setDepartments(dRes.data || []);
      setCourses(cRes.data || []);
      setTeachers(tRes.data || []);
    } catch (err) {}
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditingId(subject._id);
      setFormData({
        name: subject.name,
        code: subject.code,
        department_id: subject.department?._id || '',
        course_id: subject.course?._id || '',
        semester: subject.semester || 1,
        type: subject.type || 'Theory',
        credits: subject.credits || 3,
        teacher_id: subject.teacher?._id || '',
        status: subject.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ status: 'ACTIVE', type: 'Theory', credits: 3, semester: 1 });
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
        await api.put(`/subjects/${editingId}`, data);
      } else {
        await api.post('/subjects', data);
      }
      closeModal();
      loadSubjects();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${id}`);
        loadSubjects();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-main tracking-tight">Subjects</h2>
          <p className="text-secondary text-sm mt-1">Course syllabus and assignments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary flex items-center" onClick={() => openModal()}>
            <Plus size={16} className="mr-2" /> Add Subject
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper relative min-h-[300px] bg-surface">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="spinner"></div>
            </div>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Type</th>
                <th>Credits</th>
                <th>Assigned Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id}>
                  <td className="font-mono text-sm font-semibold">{sub.code}</td>
                  <td className="font-medium text-dark">{sub.name}</td>
                  <td>{sub.course?.code || '—'}</td>
                  <td>Sem {sub.semester}</td>
                  <td>
                    <span className={`badge ${sub.type === 'Theory' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {sub.type}
                    </span>
                  </td>
                  <td>{sub.credits}</td>
                  <td>{sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'Unassigned'}</td>
                  <td>
                    {user?.role === 'ADMIN' && (
                      <div className="flex space-x-2">
                        <button className="p-1.5 text-secondary hover:text-primary rounded-md hover:bg-blue-50 transition-colors" onClick={() => openModal(sub)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-secondary hover:text-danger rounded-md hover:bg-red-50 transition-colors" onClick={() => handleDelete(sub._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-secondary">
                      <BookMarked size={48} className="mb-2 opacity-50" />
                      <p>No subjects found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl flex flex-col overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="text-lg font-bold text-main">{editingId ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="subject-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="form-label text-main">Subject Code *</label>
                    <input type="text" name="code" defaultValue={formData.code} required className="form-control text-main" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="form-label text-main">Subject Name *</label>
                    <input type="text" name="name" defaultValue={formData.name} required className="form-control text-main" />
                  </div>
                  
                  <div>
                    <label className="form-label text-main">Department *</label>
                    <select name="department_id" defaultValue={formData.department_id} required className="form-control text-main">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main">Course / Program *</label>
                    <select name="course_id" defaultValue={formData.course_id} required className="form-control text-main">
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-main">Semester *</label>
                    <input type="number" name="semester" defaultValue={formData.semester} required min="1" max="12" className="form-control text-main" />
                  </div>
                  <div>
                    <label className="form-label text-main">Assigned Teacher</label>
                    <select name="teacher_id" defaultValue={formData.teacher_id} className="form-control text-main">
                      <option value="">Unassigned</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-main">Subject Type</label>
                    <select name="type" defaultValue={formData.type} className="form-control text-main">
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main">Credits</label>
                    <input type="number" name="credits" defaultValue={formData.credits} min="1" max="6" className="form-control text-main" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end space-x-3">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="subject-form" disabled={saving} className="btn btn-primary flex items-center">
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                {saving ? 'Saving...' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
