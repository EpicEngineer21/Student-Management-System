'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      // For demo, just fetch recent attendance if admin/teacher, or own if student
      const url = user?.role === 'STUDENT' ? `/attendance?student=${user.id}` : '/attendance?limit=20';
      const res = await api.get(url);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Attendance Tracker</h2>
          <p className="text-gray-500 text-sm">Monitor student presence and absences</p>
        </div>
        {user?.role === 'TEACHER' && (
          <button className="btn btn-primary">Mark Attendance</button>
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
                      <div className="font-medium text-dark">{rec.student?.firstName} {rec.student?.lastName}</div>
                      <div className="text-xs text-gray-500">{rec.student?.enrollmentNumber}</div>
                    </td>
                  )}
                  <td>
                    <div className="font-medium">{rec.subject?.name}</div>
                    <div className="text-xs text-gray-500">{rec.subject?.code}</div>
                  </td>
                  {user?.role !== 'TEACHER' && (
                    <td>{rec.teacher?.firstName} {rec.teacher?.lastName}</td>
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
                  <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="text-center py-10 text-gray-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
