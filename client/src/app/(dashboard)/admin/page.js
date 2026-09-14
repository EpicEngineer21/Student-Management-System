'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import Link from 'next/link';

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
          { label: 'Total Students', value: data.stats.totalStudents, icon: '🎓', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Teachers', value: data.stats.totalTeachers, icon: '👨‍🏫', color: 'bg-green-50 text-green-600' },
          { label: 'Departments', value: data.stats.totalDepts, icon: '🏢', color: 'bg-purple-50 text-purple-600' },
          { label: 'Active Exams', value: data.stats.activeExams, icon: '📝', color: 'bg-yellow-50 text-yellow-600' },
        ].map((s, i) => (
          <div key={i} className="card p-6 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
              <h3 className="text-2xl font-bold text-dark">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title">Recent Notices</h3>
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
                    <td className="font-medium">{n.title}</td>
                    <td>{n.category}</td>
                    <td><span className={`badge ${n.priority === 'HIGH' ? 'badge-danger' : n.priority === 'MEDIUM' ? 'badge-warning' : 'badge-primary'}`}>{n.priority}</span></td>
                    <td>{formatDate(n.createdAt)}</td>
                  </tr>
                ))}
                {data.recentNotices.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-4 text-gray-500">No recent notices</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Activity</h3>
          </div>
          <div className="card-body p-0">
            <ul className="divide-y divide-gray-100">
              {data.recentActivity.map((log) => (
                <li key={log._id} className="p-4 hover:bg-gray-50">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-dark">{log.action}</h3>
                        <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <p className="text-sm text-gray-500">by {log.userEmail || 'System'} ({log.role})</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
