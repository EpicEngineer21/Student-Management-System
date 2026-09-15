'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { gradeColor } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { FileSpreadsheet, Check, X, Upload } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-main">Marks & Results</h2>
          <p className="text-secondary text-sm">Academic performance tracking</p>
        </div>
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <button className="btn btn-primary flex items-center" onClick={openModal}>
            <Upload size={16} className="mr-2" /> Upload Marks
          </button>
        )}
      </div>

      <div className="card bg-surface">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="spinner border-main border-t-transparent"></div>
            </div>
          )}
          <table className="table w-full">
            <thead>
              <tr className="border-b border-border">
                {user?.role !== 'STUDENT' && <th className="text-secondary">Student</th>}
                <th className="text-secondary">Subject</th>
                <th className="text-secondary">Exam</th>
                <th className="text-secondary">Breakdown (Int/Ass/Mid/Pr/End)</th>
                <th className="text-secondary">Total</th>
                <th className="text-secondary">Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => {
                const total = (mark.internalMarks || mark.internal_marks || 0) + (mark.assignmentMarks || mark.assignment_marks || 0) + (mark.midtermMarks || mark.midterm_marks || 0) + (mark.practicalMarks || mark.practical_marks || 0) + (mark.endtermMarks || mark.endterm_marks || 0);
                return (
                  <tr key={mark._id} className="border-b border-border hover:bg-background/50">
                    {user?.role !== 'STUDENT' && (
                      <td className="py-3 px-4">
                        <div className="font-medium text-main">{mark.student?.firstName || mark.first_name} {mark.student?.lastName || mark.last_name}</div>
                        <div className="text-xs text-secondary">{mark.student?.enrollmentNumber || mark.enrollment_number}</div>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="font-medium text-main">{mark.subject?.name || mark.subject_name}</div>
                      <div className="text-xs text-secondary">{mark.subject?.code || mark.subject_code}</div>
                    </td>
                    <td className="py-3 px-4 text-main">{mark.exam?.name || mark.exam_name}</td>
                    <td className="font-mono text-xs text-secondary tracking-wider py-3 px-4">
                      {mark.internalMarks || mark.internal_marks || 0}/{mark.assignmentMarks || mark.assignment_marks || 0}/{mark.midtermMarks || mark.midterm_marks || 0}/{mark.practicalMarks || mark.practical_marks || 0}/{mark.endtermMarks || mark.endterm_marks || 0}
                    </td>
                    <td className="font-bold text-main py-3 px-4">{total} / {mark.maxMarks || mark.max_marks}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold ${gradeColor(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {marks.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} className="text-center py-10 text-secondary">No marks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Marks Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-main flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary" />
                Upload / Update Marks
              </h3>
              <button onClick={closeModal} className="text-secondary hover:text-main">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="marks-form" className="space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-6">
                  <div>
                    <label className="form-label text-secondary mb-1 block text-sm">Student *</label>
                    <select name="student_id" required className="form-control bg-background border-border text-main w-full rounded-md p-2">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNumber})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-secondary mb-1 block text-sm">Subject *</label>
                    <select name="subject_id" required className="form-control bg-background border-border text-main w-full rounded-md p-2">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-secondary mb-1 block text-sm">Exam *</label>
                    <select name="exam_id" required className="form-control bg-background border-border text-main w-full rounded-md p-2">
                      <option value="">Select Exam</option>
                      {exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.type})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="form-label text-xs text-secondary mb-1 block">Internal (10)</label>
                    <input type="number" name="internal_marks" defaultValue={0} min="0" max="10" className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs text-secondary mb-1 block">Assignment (10)</label>
                    <input type="number" name="assignment_marks" defaultValue={0} min="0" max="10" className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs text-secondary mb-1 block">Mid-Term (20)</label>
                    <input type="number" name="midterm_marks" defaultValue={0} min="0" max="20" className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs text-secondary mb-1 block">Practical (20)</label>
                    <input type="number" name="practical_marks" defaultValue={0} min="0" max="20" className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs text-secondary mb-1 block">End-Term (40)</label>
                    <input type="number" name="endterm_marks" defaultValue={0} min="0" max="100" className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="form-label text-secondary mb-1 block text-sm">Total Max Marks</label>
                    <input type="number" name="max_marks" defaultValue={100} className="form-control bg-background border-border text-main w-full rounded-md p-2" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="is_published" id="is_published" value="true" defaultChecked className="h-4 w-4 text-primary rounded border-border bg-background" />
                    <label htmlFor="is_published" className="ml-2 block text-sm text-secondary">Publish immediately</label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-end space-x-3 rounded-b-xl">
              <button onClick={closeModal} type="button" className="btn btn-secondary border border-border text-secondary hover:text-main bg-background">Cancel</button>
              <button type="submit" form="marks-form" disabled={saving} className="btn btn-primary flex items-center">
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Check size={16} className="mr-2" /> Save Marks
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
