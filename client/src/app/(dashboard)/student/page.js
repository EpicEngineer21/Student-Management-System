'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/dashboard/student');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner mt-10 mx-auto"></div>;
  if (!data) return <div>Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Welcome back, {data.student.firstName}!</h2>
          <p className="text-gray-500 mt-1">{data.student.course_name} • Semester {data.student.currentSemester}</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-800 rounded border border-blue-100 font-mono text-sm">
          Enrollment: {data.student.enrollmentNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Overall Attendance</p>
          <div className={`text-4xl font-bold ${data.attendance.percentage >= 75 ? 'text-success' : 'text-danger'}`}>
            {data.attendance.percentage}%
          </div>
          <p className="text-xs text-gray-400 mt-2">{data.attendance.present} / {data.attendance.total} Classes</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Current CGPA</p>
          <div className="text-4xl font-bold text-primary">{data.cgpa}</div>
          <p className="text-xs text-gray-400 mt-2">Out of 10.0</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Subjects</p>
          <div className="text-4xl font-bold text-purple-600">{data.totalSubjects}</div>
          <p className="text-xs text-gray-400 mt-2">This Semester</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Pending Assignments</p>
          <div className="text-4xl font-bold text-orange-500">{data.pendingAssignments}</div>
          <p className="text-xs text-gray-400 mt-2">Action Required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Upcoming Exams</h3><Link href="/exams" className="text-sm text-primary">View All</Link></div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <tbody>
                {data.upcomingExams.map((e) => (
                  <tr key={e._id}>
                    <td><div className="font-medium text-dark">{e.name}</div><div className="text-xs text-gray-500">{e.type}</div></td>
                    <td className="text-right text-sm font-semibold">{formatDate(e.start_date)}</td>
                  </tr>
                ))}
                {data.upcomingExams.length === 0 && <tr><td colSpan="2" className="text-center py-4 text-gray-500">No upcoming exams</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Notices</h3><Link href="/notices" className="text-sm text-primary">View All</Link></div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <tbody>
                {data.recentNotices.map((n) => (
                  <tr key={n._id}>
                    <td><div className="font-medium text-dark">{n.title}</div><div className="text-xs text-gray-500">{formatDate(n.createdAt)}</div></td>
                    <td><span className={`badge ${n.priority === 'HIGH' ? 'badge-danger' : 'badge-primary'}`}>{n.priority}</span></td>
                  </tr>
                ))}
                {data.recentNotices.length === 0 && <tr><td colSpan="2" className="text-center py-4 text-gray-500">No recent notices</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
