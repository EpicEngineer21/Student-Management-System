'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { CalendarCheck, Check, X, ClipboardCheck } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' }

  useEffect(() => {
    loadAttendance();
    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      loadDependencies();
    }
  }, [user]);

  const loadAttendance = async () => {
    try {
      const url = user?.role === 'STUDENT' ? `/attendance?student=${user.id}` : '/attendance?limit=20';
      const res = await api.get(url);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [subRes, stuRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/students?limit=500')
      ]);
      setSubjects(subRes.data || []);
      setStudents(stuRes.data || []);
    } catch (err) {}
  };

  const openModal = () => {
    const defaultAtt = {};
    students.forEach(s => defaultAtt[s._id] = 'Present'); // Default everyone to present
    setAttendanceData(defaultAtt);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const toggleStatus = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : prev[studentId] === 'Absent' ? 'Late' : 'Present'
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData(e.target);
    const payload = {
      subject_id: data.get('subject_id'),
      date: data.get('date'),
      records: students.map(s => ({
        student_id: s._id,
        status: attendanceData[s._id] || 'Present',
        remarks: ''
      }))
    };
    
    try {
      await api.post('/attendance/bulk', payload);
      closeModal();
      loadAttendance();
    } catch (err) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-main">Attendance Tracker</h2>
          <p className="text-secondary text-sm">Monitor student presence and absences</p>
        </div>
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <button className="btn btn-primary flex items-center" onClick={openModal}>
            <ClipboardCheck size={16} className="mr-2" /> Mark Attendance
          </button>
        )}
      </div>

      <div className="card bg-surface">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-surface/70 flex items-center justify-center z-10">
              <div className="spinner"></div>
            </div>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                {user?.role !== 'STUDENT' && <th>Student</th>}
                <th>Subject</th>
                {user?.role !== 'TEACHER' && <th>Teacher</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id}>
                  <td>{formatDate(rec.date)}</td>
                  {user?.role !== 'STUDENT' && (
                    <td>
                      <div className="font-medium text-main">{rec.student?.firstName || rec.first_name} {rec.student?.lastName || rec.last_name}</div>
                      <div className="text-xs text-secondary">{rec.student?.enrollmentNumber || rec.enrollment_number}</div>
                    </td>
                  )}
                  <td>
                    <div className="font-medium text-main">{rec.subject?.name || rec.subject_name}</div>
                    <div className="text-xs text-secondary">{rec.subject?.code || rec.subject_code}</div>
                  </td>
                  {user?.role !== 'TEACHER' && (
                    <td className="text-main">{rec.teacher?.firstName || '—'} {rec.teacher?.lastName || ''}</td>
                  )}
                  <td>
                    <span className={`badge ${
                      rec.status === 'Present' ? 'badge-success' 
                      : rec.status === 'Absent' ? 'badge-danger' 
                      : 'badge-warning'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="text-center py-10 text-secondary">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-main">Mark Class Attendance</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main transition-colors"><X size={20} /></button>
            </div>
            
            <form id="attendance-form" className="flex flex-col overflow-hidden" onSubmit={handleSave}>
              <div className="p-6 bg-surface border-b border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-main">Subject *</label>
                    <select name="subject_id" required className="form-control bg-background text-main border-border">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main">Date *</label>
                    <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="form-control bg-background text-main border-border" />
                  </div>
                </div>
              </div>
              
              <div className="p-0 overflow-y-auto flex-1 bg-surface">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface sticky top-0 border-b border-border shadow-sm">
                    <tr>
                      <th className="py-3 px-6 text-xs font-semibold text-secondary uppercase tracking-wider">Student Name</th>
                      <th className="py-3 px-6 text-xs font-semibold text-secondary uppercase tracking-wider">Enrollment No.</th>
                      <th className="py-3 px-6 text-xs font-semibold text-secondary uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map(student => (
                      <tr key={student._id} className="hover:bg-background/50 transition-colors">
                        <td className="py-3 px-6 font-medium text-main">{student.firstName} {student.lastName}</td>
                        <td className="py-3 px-6 text-sm text-secondary">{student.enrollmentNumber}</td>
                        <td className="py-3 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => toggleStatus(student._id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold w-24 transition-colors ${
                              attendanceData[student._id] === 'Present' ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' :
                              attendanceData[student._id] === 'Absent' ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200' :
                              'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'
                            }`}
                          >
                            {attendanceData[student._id] || 'Present'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-secondary">No students available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-border bg-surface flex justify-between items-center rounded-b-xl">
                <div className="text-sm text-secondary">
                  <span className="font-bold text-main">{students.length}</span> Total Students
                </div>
                <div className="flex space-x-3">
                  <button onClick={closeModal} type="button" className="btn btn-secondary bg-background text-main hover:bg-border transition-colors">Cancel</button>
                  <button type="submit" disabled={saving || students.length === 0} className="btn btn-primary flex items-center">
                    {saving ? 'Saving...' : <><Check size={16} className="mr-2" /> Submit Attendance</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
