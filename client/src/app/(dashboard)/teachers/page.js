'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Teachers</h2>
          <p className="text-gray-500 text-sm">Manage faculty and staff</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Add Teacher</button>
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
                <th>Employee ID</th>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="font-mono text-sm">{teacher.employeeId}</td>
                  <td>
                    <div className="font-medium text-dark">{teacher.firstName} {teacher.lastName}</div>
                    <div className="text-xs text-gray-500">{teacher.qualification || 'N/A'}</div>
                  </td>
                  <td>{teacher.department?.name || '—'}</td>
                  <td>
                    <div>{teacher.designation}</div>
                    <div className="text-xs text-gray-500">{teacher.specialization}</div>
                  </td>
                  <td>
                    <div>{teacher.phone}</div>
                    <div className="text-xs text-gray-500">{teacher.user?.email}</div>
                  </td>
                  <td>{formatDate(teacher.joiningDate)}</td>
                  <td>
                    <span className={`badge ${statusBadge(teacher.status)}`}>{teacher.status}</span>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
