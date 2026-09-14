'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Courses / Programs</h2>
          <p className="text-gray-500 text-sm">Manage degree programs and durations</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Add Course</button>
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
                <th>Course Name</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Semesters</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="font-mono text-sm font-semibold">{course.code}</td>
                  <td className="font-medium text-dark">{course.name}</td>
                  <td>{course.department?.name || '—'}</td>
                  <td>{course.durationYears} Years</td>
                  <td>{course.totalSemesters} Sems</td>
                  <td>
                    <span className={`badge ${statusBadge(course.status)}`}>{course.status}</span>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
