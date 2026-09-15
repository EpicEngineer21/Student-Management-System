'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Users, BookOpen, FileSpreadsheet, Clock, Bell } from 'lucide-react';

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
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
        <h2 className="text-2xl font-bold text-main tracking-tight">Welcome, Prof. {data.teacher.lastName}!</h2>
        <p className="text-secondary mt-1">Department of {data.teacher.department?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center space-x-4 border-l-4 border-blue-100">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>
          <div><p className="text-sm font-medium text-secondary">My Students</p><h3 className="text-2xl font-bold text-main">{data.totalStudents}</h3></div>
        </div>
        <div className="card p-6 flex items-center space-x-4 border-l-4 border-purple-100">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <BookOpen size={24} />
          </div>
          <div><p className="text-sm font-medium text-secondary">Subjects Taught</p><h3 className="text-2xl font-bold text-main">{data.mySubjects?.length || 0}</h3></div>
        </div>
        <div className="card p-6 flex items-center space-x-4 border-l-4 border-amber-100">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
            <FileSpreadsheet size={24} />
          </div>
          <div><p className="text-sm font-medium text-secondary">Pending Marks</p><h3 className="text-2xl font-bold text-main">{data.pendingMarks}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex items-center space-x-3 py-3 px-5">
            <Clock size={18} className="text-primary" />
            <h3 className="card-title text-base font-semibold">Today&apos;s Classes</h3>
          </div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <thead><tr><th>Time</th><th>Subject</th><th>Room</th></tr></thead>
              <tbody>
                {data.todayClasses.map((c, i) => (
                  <tr key={i}>
                    <td className="font-bold text-primary font-mono">{c.start_time} - {c.end_time}</td>
                    <td className="font-medium text-main">{c.subject_name}</td>
                    <td className="text-secondary">{c.room_number}</td>
                  </tr>
                ))}
                {data.todayClasses.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-secondary">No classes scheduled today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex justify-between items-center py-3 px-5">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-primary" />
              <h3 className="card-title text-base font-semibold">Recent Notices</h3>
            </div>
            <Link href="/notices" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <tbody>
                {data.recentNotices.map((n) => (
                  <tr key={n._id}>
                    <td><div className="font-medium text-main">{n.title}</div><div className="text-xs text-secondary mt-0.5">{formatDate(n.createdAt)}</div></td>
                    <td><span className={`badge ${n.priority === 'HIGH' ? 'badge-danger' : 'badge-primary'}`}>{n.priority}</span></td>
                  </tr>
                ))}
                {data.recentNotices.length === 0 && <tr><td colSpan="2" className="text-center py-8 text-secondary">No recent notices found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
