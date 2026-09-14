'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Examinations</h2>
          <p className="text-gray-500 text-sm">Schedule and track academic exams</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Create Exam</button>
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
                <th>Exam Name</th>
                <th>Type</th>
                <th>Course & Sem</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="font-bold text-dark">{exam.name}</td>
                  <td>
                    <span className="badge badge-gray">{exam.type}</span>
                  </td>
                  <td>
                    <div>{exam.course?.code || 'All Courses'}</div>
                    <div className="text-xs text-gray-500">Sem {exam.semester}</div>
                  </td>
                  <td>{exam.academicYear}</td>
                  <td>{formatDate(exam.startDate)}</td>
                  <td>{formatDate(exam.endDate)}</td>
                  <td>
                    <span className={`badge ${statusBadge(exam.status)}`}>{exam.status}</span>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">No exams scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
