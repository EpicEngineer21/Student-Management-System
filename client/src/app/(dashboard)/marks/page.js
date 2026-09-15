'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { gradeColor } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function MarksPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Dependencies
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    loadMarks();
    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      loadDependencies();
    }
  }, [user]);

  const loadMarks = async () => {
    try {
      const url = user?.role === 'STUDENT' ? `/marks?student=${user.id}` : '/marks?limit=50';
      const res = await api.get(url);
      setMarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [stuRes, subRes, examRes] = await Promise.all([
        api.get('/students?limit=500'),
        api.get('/subjects'),
        api.get('/exams')
      ]);
      setStudents(stuRes.data || []);
      setSubjects(subRes.data || []);
      setExams(examRes.data || []);
    } catch (err) {}
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await api.post('/marks', data);
      closeModal();
      loadMarks();
    } catch (err) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Marks & Results</h2>
          <p className="text-gray-500 text-sm">Academic performance tracking</p>
        </div>
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <button className="btn btn-primary" onClick={openModal}>+ Upload Marks</button>
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
                {user?.role !== 'STUDENT' && <th>Student</th>}
                <th>Subject</th>
                <th>Exam</th>
                <th>Breakdown (Int/Ass/Mid/Pr/End)</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => {
                const total = (mark.internalMarks || mark.internal_marks || 0) + (mark.assignmentMarks || mark.assignment_marks || 0) + (mark.midtermMarks || mark.midterm_marks || 0) + (mark.practicalMarks || mark.practical_marks || 0) + (mark.endtermMarks || mark.endterm_marks || 0);
                return (
                  <tr key={mark._id}>
                    {user?.role !== 'STUDENT' && (
                      <td>
                        <div className="font-medium text-dark">{mark.student?.firstName || mark.first_name} {mark.student?.lastName || mark.last_name}</div>
                        <div className="text-xs text-gray-500">{mark.student?.enrollmentNumber || mark.enrollment_number}</div>
                      </td>
                    )}
                    <td>
                      <div className="font-medium">{mark.subject?.name || mark.subject_name}</div>
                      <div className="text-xs text-gray-500">{mark.subject?.code || mark.subject_code}</div>
                    </td>
                    <td>{mark.exam?.name || mark.exam_name}</td>
                    <td className="font-mono text-xs text-gray-500 tracking-wider">
                      {mark.internalMarks || mark.internal_marks || 0}/{mark.assignmentMarks || mark.assignment_marks || 0}/{mark.midtermMarks || mark.midterm_marks || 0}/{mark.practicalMarks || mark.practical_marks || 0}/{mark.endtermMarks || mark.endterm_marks || 0}
                    </td>
                    <td className="font-bold text-dark">{total} / {mark.maxMarks || mark.max_marks}</td>
                    <td>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold ${gradeColor(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {marks.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} className="text-center py-10 text-gray-500">No marks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Marks Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">Upload / Update Marks</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <form id="marks-form" className="space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <label className="form-label">Student *</label>
                    <select name="student_id" required className="form-control">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNumber})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <select name="subject_id" required className="form-control">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Exam *</label>
                    <select name="exam_id" required className="form-control">
                      <option value="">Select Exam</option>
                      {exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.type})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="form-label text-xs">Internal (10)</label>
                    <input type="number" name="internal_marks" defaultValue={0} min="0" max="10" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Assignment (10)</label>
                    <input type="number" name="assignment_marks" defaultValue={0} min="0" max="10" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Mid-Term (20)</label>
                    <input type="number" name="midterm_marks" defaultValue={0} min="0" max="20" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Practical (20)</label>
                    <input type="number" name="practical_marks" defaultValue={0} min="0" max="20" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label text-xs">End-Term (40)</label>
                    <input type="number" name="endterm_marks" defaultValue={0} min="0" max="100" className="form-control" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="form-label">Total Max Marks</label>
                    <input type="number" name="max_marks" defaultValue={100} className="form-control" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="is_published" id="is_published" value="true" defaultChecked className="h-4 w-4 text-primary rounded border-gray-300" />
                    <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">Publish immediately</label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="marks-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
