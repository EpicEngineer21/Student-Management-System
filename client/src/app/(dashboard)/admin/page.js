'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Users, GraduationCap, Building2, BookOpen, Clock, Activity, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/dashboard/admin');
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
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: data.stats.totalStudents, icon: Users, color: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600', border: 'border-blue-500' },
          { label: 'Total Teachers', value: data.stats.totalTeachers, icon: GraduationCap, color: 'bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600', border: 'border-emerald-500' },
          { label: 'Departments', value: data.stats.totalDepts, icon: Building2, color: 'bg-gradient-to-br from-purple-50 to-fuchsia-100 text-purple-600', border: 'border-purple-500' },
          { label: 'Active Exams', value: data.stats.activeExams, icon: FileText, color: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600', border: 'border-amber-500' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`card p-6 flex items-center space-x-5 border-l-[6px] ${s.border} group`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${s.color} transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                <Icon size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">{s.label}</p>
                <h3 className="text-3xl font-extrabold text-main tracking-tight">{s.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                <BookOpen size={18} className="text-primary" />
              </div>
              Recent Notices
            </h3>
            <Link href="/notices" className="text-sm text-primary font-semibold hover:text-primary-hover hover:underline transition-all">View All →</Link>
          </div>
          <div className="p-0 table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentNotices.map((n) => (
                  <tr key={n._id}>
                    <td className="font-medium text-main">{n.title}</td>
                    <td className="text-secondary">{n.category}</td>
                    <td>
                      <span className={`badge ${n.priority === 'HIGH' ? 'badge-danger' : n.priority === 'MEDIUM' ? 'badge-warning' : 'badge-primary'}`}>
                        {n.priority}
                      </span>
                    </td>
                    <td className="text-secondary">{formatDate(n.createdAt)}</td>
                  </tr>
                ))}
                {data.recentNotices.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-6 text-secondary">No recent notices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
                <Activity size={18} className="text-indigo-600" />
              </div>
              System Activity
            </h3>
          </div>
          <div className="card-body p-0">
            <ul className="divide-y divide-border">
              {data.recentActivity.map((log) => (
                <li key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex space-x-3">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-sm flex items-center justify-center">
                        <Clock size={14} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-main leading-tight">{log.action}</h3>
                      </div>
                      <p className="text-xs text-secondary mt-1 font-medium">
                        by <span className="font-semibold text-primary">{log.userEmail || 'System'}</span> 
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 ml-2 uppercase tracking-wide border border-slate-200">{log.role}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {data.recentActivity.length === 0 && (
                <li className="p-6 text-center text-secondary">No recent activity</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
