'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/dashboard/teacher');
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-dark">Welcome, Prof. {data.teacher.lastName}!</h2>
        <p className="text-gray-500 mt-1">Department of {data.teacher.department?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-blue-50 text-blue-600">👨‍🎓</div>
          <div><p className="text-sm font-medium text-gray-500">My Students</p><h3 className="text-2xl font-bold text-dark">{data.totalStudents}</h3></div>
        </div>
        <div className="card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-purple-50 text-purple-600">📖</div>
          <div><p className="text-sm font-medium text-gray-500">Subjects Taught</p><h3 className="text-2xl font-bold text-dark">{data.mySubjects?.length || 0}</h3></div>
        </div>
        <div className="card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-yellow-50 text-yellow-600">📝</div>
          <div><p className="text-sm font-medium text-gray-500">Pending Marks</p><h3 className="text-2xl font-bold text-dark">{data.pendingMarks}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Today's Classes</h3></div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <thead><tr><th>Time</th><th>Subject</th><th>Room</th></tr></thead>
              <tbody>
                {data.todayClasses.map((c, i) => (
                  <tr key={i}>
                    <td className="font-bold text-primary">{c.start_time} - {c.end_time}</td>
                    <td className="font-medium">{c.subject_name}</td>
                    <td>{c.room_number}</td>
                  </tr>
                ))}
                {data.todayClasses.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-gray-500">No classes today</td></tr>}
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
