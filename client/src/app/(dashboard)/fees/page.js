'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function FeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const res = await api.get('/fees');
      setFees(res.data);
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
          <h2 className="text-2xl font-bold text-dark">Fee Management</h2>
          <p className="text-gray-500 text-sm">Track tuition and other payments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Generate Invoice</button>
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
                <th>Receipt / ID</th>
                {user?.role !== 'STUDENT' && <th>Student</th>}
                <th>Fee Type</th>
                <th>Academic Year & Sem</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td className="font-mono text-sm">{fee.receiptNumber || '—'}</td>
                  {user?.role !== 'STUDENT' && (
                    <td>
                      <div className="font-medium text-dark">{fee.student?.firstName} {fee.student?.lastName}</div>
                      <div className="text-xs text-gray-500">{fee.student?.enrollmentNumber}</div>
                    </td>
                  )}
                  <td className="font-medium">{fee.feeType}</td>
                  <td>
                    <div>{fee.academicYear}</div>
                    <div className="text-xs text-gray-500">Sem {fee.semester}</div>
                  </td>
                  <td className="font-semibold text-dark">₹{fee.totalAmount.toLocaleString()}</td>
                  <td className="text-success font-medium">₹{(fee.paidAmount || 0).toLocaleString()}</td>
                  <td>{formatDate(fee.dueDate)}</td>
                  <td>
                    <span className={`badge ${statusBadge(fee.status)}`}>{fee.status}</span>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 8 : 7} className="text-center py-10 text-gray-500">No fee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
