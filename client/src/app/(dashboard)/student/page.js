'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, PenTool, BookOpen, Clock, Bell, User } from 'lucide-react';

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
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-main tracking-tight">Welcome back, {data.student.firstName}!</h2>
            <p className="text-secondary mt-1">{data.student.course_name} <span className="mx-2 text-border">•</span> Semester {data.student.currentSemester}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-background text-secondary rounded-lg border border-border font-mono text-sm shadow-sm">
          ID: {data.student.enrollmentNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-secondary mb-3 uppercase tracking-wider">Attendance</p>
          <div className={`text-4xl font-bold ${data.attendance.percentage >= 75 ? 'text-success' : 'text-danger'}`}>
            {data.attendance.percentage}%
          </div>
          <p className="text-xs text-secondary mt-3 bg-background px-3 py-1 rounded-full border border-border">{data.attendance.present} / {data.attendance.total} Classes</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center border-t-4 border-primary">
          <p className="text-sm font-medium text-secondary mb-3 uppercase tracking-wider">Current CGPA</p>
          <div className="text-4xl font-bold text-main">{data.cgpa}</div>
          <p className="text-xs text-secondary mt-3">Out of 10.0</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center border-t-4 border-purple-500">
          <p className="text-sm font-medium text-secondary mb-3 uppercase tracking-wider">Subjects</p>
          <div className="text-4xl font-bold text-main">{data.totalSubjects}</div>
          <p className="text-xs text-secondary mt-3">This Semester</p>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center border-t-4 border-orange-500">
          <p className="text-sm font-medium text-secondary mb-3 uppercase tracking-wider">Assignments</p>
          <div className="text-4xl font-bold text-orange-500">{data.pendingAssignments}</div>
          <p className="text-xs text-secondary mt-3">Action Required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex justify-between items-center py-3 px-5">
            <div className="flex items-center space-x-3">
              <PenTool size={18} className="text-primary" />
              <h3 className="card-title text-base font-semibold">Upcoming Exams</h3>
            </div>
            <Link href="/exams" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <tbody>
                {data.upcomingExams.map((e) => (
                  <tr key={e._id}>
                    <td><div className="font-medium text-main">{e.name}</div><div className="text-xs text-secondary mt-0.5">{e.type}</div></td>
                    <td className="text-right text-sm font-medium text-main">{formatDate(e.start_date)}</td>
                  </tr>
                ))}
                {data.upcomingExams.length === 0 && <tr><td colSpan="2" className="text-center py-8 text-secondary">No upcoming exams</td></tr>}
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
