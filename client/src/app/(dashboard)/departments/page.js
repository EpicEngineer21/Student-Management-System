'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Departments</h2>
          <p className="text-gray-500 text-sm">Academic divisions and HODs</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Add Department</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10"><div className="spinner"></div></div>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} className="card hover:shadow-md transition-shadow">
              <div className="card-header border-b-2 border-primary">
                <div>
                  <h3 className="card-title">{dept.name}</h3>
                  <p className="text-sm font-mono text-gray-500">{dept.code}</p>
                </div>
                <span className={`badge ${statusBadge(dept.status)}`}>{dept.status}</span>
              </div>
              <div className="card-body bg-gray-50/50">
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Head of Department</div>
                  <div className="font-medium text-dark">{dept.hodName || 'Not Assigned'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.stats?.courses || 0}</div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.stats?.teachers || 0}</div>
                    <div className="text-xs text-gray-500">Teachers</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">{dept.stats?.students || 0}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && departments.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">No departments found.</div>
        )}
      </div>
    </div>
  );
}
