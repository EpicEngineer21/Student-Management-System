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
          { label: 'Total Students', value: data.stats.totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Total Teachers', value: data.stats.totalTeachers, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Departments', value: data.stats.totalDepts, icon: Building2, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
          { label: 'Active Exams', value: data.stats.activeExams, icon: FileText, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`card p-6 flex items-center space-x-4 border-l-4 ${s.border}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">{s.label}</p>
                <h3 className="text-2xl font-bold text-main">{s.value}</h3>
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
              <BookOpen size={18} className="mr-2 text-primary" />
              Recent Notices
            </h3>
            <Link href="/notices" className="text-sm text-primary font-medium hover:underline">View All</Link>
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
              <Activity size={18} className="mr-2 text-primary" />
              System Activity
            </h3>
          </div>
          <div className="card-body p-0">
            <ul className="divide-y divide-border">
              {data.recentActivity.map((log) => (
                <li key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex space-x-3">
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Clock size={14} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-main leading-tight">{log.action}</h3>
                      </div>
                      <p className="text-xs text-secondary mt-1">
                        by <span className="font-medium text-main">{log.userEmail || 'System'}</span> ({log.role})
                        <span className="mx-1">•</span>
                        {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
