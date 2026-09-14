'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Subjects</h2>
          <p className="text-gray-500 text-sm">Course syllabus and assignments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Add Subject</button>
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
                <th>Code</th>
                <th>Subject Name</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Type</th>
                <th>Credits</th>
                <th>Assigned Teacher</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id}>
                  <td className="font-mono text-sm font-semibold">{sub.code}</td>
                  <td className="font-medium text-dark">{sub.name}</td>
                  <td>{sub.course?.code || '—'}</td>
                  <td>Sem {sub.semester}</td>
                  <td>
                    <span className={`badge ${sub.type === 'Theory' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {sub.type}
                    </span>
                  </td>
                  <td>{sub.credits}</td>
                  <td>{sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'Unassigned'}</td>
                </tr>
              ))}
              {subjects.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">No subjects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
