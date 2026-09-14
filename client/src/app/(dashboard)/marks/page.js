'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { gradeColor } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function MarksPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarks();
  }, []);

  const loadMarks = async () => {
    try {
      const url = user?.role === 'STUDENT' ? `/marks?student=${user.id}` : '/marks?limit=20';
      const res = await api.get(url);
      setMarks(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Marks & Results</h2>
          <p className="text-gray-500 text-sm">Academic performance tracking</p>
        </div>
        {user?.role === 'TEACHER' && (
          <button className="btn btn-primary">Upload Marks</button>
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
                {user?.role !== 'STUDENT' && <th>Student</th>}
                <th>Subject</th>
                <th>Exam</th>
                <th>Breakdown (Int/Ass/Mid/Pr/End)</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => {
                const total = mark.internalMarks + mark.assignmentMarks + mark.midtermMarks + mark.practicalMarks + mark.endtermMarks;
                return (
                  <tr key={mark._id}>
                    {user?.role !== 'STUDENT' && (
                      <td>
                        <div className="font-medium text-dark">{mark.student?.firstName} {mark.student?.lastName}</div>
                        <div className="text-xs text-gray-500">{mark.student?.enrollmentNumber}</div>
                      </td>
                    )}
                    <td>
                      <div className="font-medium">{mark.subject?.name}</div>
                      <div className="text-xs text-gray-500">{mark.subject?.code}</div>
                    </td>
                    <td>{mark.exam?.name}</td>
                    <td className="font-mono text-xs text-gray-500 tracking-wider">
                      {mark.internalMarks}/{mark.assignmentMarks}/{mark.midtermMarks}/{mark.practicalMarks}/{mark.endtermMarks}
                    </td>
                    <td className="font-bold text-dark">{total} / {mark.maxMarks}</td>
                    <td>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold ${gradeColor(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {marks.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} className="text-center py-10 text-gray-500">No marks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
