'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function FeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Dependencies
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadFees();
    if (user?.role === 'ADMIN') loadStudents();
  }, [user]);

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

  const loadStudents = async () => {
    try {
      const res = await api.get('/students?limit=500'); // Load many for dropdown
      setStudents(res.data || []);
    } catch (err) {}
  };

  const openModal = (fee = null) => {
    if (fee) {
      setEditingId(fee._id);
      setFormData({
        student_id: fee.student?._id || '',
        fee_type: fee.feeType,
        academic_year: fee.academicYear,
        semester: fee.semester || 1,
        total_amount: fee.totalAmount,
        paid_amount: fee.paidAmount || 0,
        due_date: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
        payment_mode: fee.paymentMode || '',
        receipt_number: fee.receiptNumber || '',
        remarks: fee.remarks || ''
      });
    } else {
      setEditingId(null);
      setFormData({ fee_type: 'Tuition', academic_year: '2025-26', semester: 1, total_amount: 0, paid_amount: 0 });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (editingId) {
        await api.put(`/fees/${editingId}`, data);
      } else {
        await api.post('/fees', data);
      }
      closeModal();
      loadFees();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
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
          <button className="btn btn-primary" onClick={() => openModal()}>+ Generate Invoice</button>
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
                {user?.role === 'ADMIN' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td className="font-mono text-sm">{fee.receiptNumber || '—'}</td>
                  {user?.role !== 'STUDENT' && (
                    <td>
                      <div className="font-medium text-dark">{fee.first_name} {fee.last_name}</div>
                      <div className="text-xs text-gray-500">{fee.enrollment_number}</div>
                    </td>
                  )}
                  <td className="font-medium">{fee.feeType || fee.fee_type}</td>
                  <td>
                    <div>{fee.academicYear || fee.academic_year}</div>
                    <div className="text-xs text-gray-500">Sem {fee.semester}</div>
                  </td>
                  <td className="font-semibold text-dark">₹{(fee.totalAmount || fee.total_amount)?.toLocaleString()}</td>
                  <td className="text-success font-medium">₹{(fee.paidAmount || fee.paid_amount || 0)?.toLocaleString()}</td>
                  <td>{formatDate(fee.dueDate || fee.due_date)}</td>
                  <td>
                    <span className={`badge ${statusBadge(fee.status)}`}>{fee.status}</span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      <button className="text-primary hover:text-primary-dark font-medium text-sm" onClick={() => openModal(fee)}>Update</button>
                    </td>
                  )}
                </tr>
              ))}
              {fees.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 9 : (user?.role === 'STUDENT' ? 7 : 8)} className="text-center py-10 text-gray-500">No fee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Update Payment' : 'Generate Invoice'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <form id="fee-form" className="space-y-4" onSubmit={handleSave}>
                {!editingId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="form-label">Student *</label>
                      <select name="student_id" defaultValue={formData.student_id} required className="form-control">
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNumber})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Academic Year *</label>
                      <input type="text" name="academic_year" defaultValue={formData.academic_year} required placeholder="2025-26" className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Semester *</label>
                      <input type="number" name="semester" defaultValue={formData.semester} required min="1" max="12" className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Fee Type *</label>
                      <select name="fee_type" defaultValue={formData.fee_type} required className="form-control">
                        <option value="Tuition">Tuition Fee</option>
                        <option value="Hostel">Hostel Fee</option>
                        <option value="Library">Library Fee</option>
                        <option value="Exam">Examination Fee</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Total Amount (₹) *</label>
                      <input type="number" name="total_amount" defaultValue={formData.total_amount} required min="0" className="form-control" />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <label className="form-label">Paid Amount (₹)</label>
                    <input type="number" name="paid_amount" defaultValue={formData.paid_amount} min="0" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Due Date</label>
                    <input type="date" name="due_date" defaultValue={formData.due_date} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Payment Mode</label>
                    <select name="payment_mode" defaultValue={formData.payment_mode} className="form-control">
                      <option value="">Pending / Not Applicable</option>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="ONLINE">Online Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Receipt Number</label>
                    <input type="text" name="receipt_number" defaultValue={formData.receipt_number} className="form-control" />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Remarks / Notes</label>
                    <input type="text" name="remarks" defaultValue={formData.remarks} className="form-control" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="fee-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : (editingId ? 'Update Record' : 'Create Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
