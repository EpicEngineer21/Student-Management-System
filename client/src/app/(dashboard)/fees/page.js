'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Banknote, Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-main">Fee Management</h2>
          <p className="text-secondary text-sm">Track tuition and other payments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary flex items-center" onClick={() => openModal()}>
            <Plus size={16} className="mr-2" /> Record Fee
          </button>
        )}
      </div>

      <div className="card bg-surface">
        <div className="table-wrapper relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-surface/70 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          <table className="table w-full">
            <thead>
              <tr className="text-secondary">
                <th className="text-left font-medium">Receipt / ID</th>
                {user?.role !== 'STUDENT' && <th className="text-left font-medium">Student</th>}
                <th className="text-left font-medium">Fee Type</th>
                <th className="text-left font-medium">Academic Year & Sem</th>
                <th className="text-left font-medium">Total Due</th>
                <th className="text-left font-medium">Paid</th>
                <th className="text-left font-medium">Due Date</th>
                <th className="text-left font-medium">Status</th>
                {user?.role === 'ADMIN' && <th className="text-left font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id} className="border-b border-border hover:bg-background/50">
                  <td className="font-mono text-sm text-main py-3">{fee.receiptNumber || '—'}</td>
                  {user?.role !== 'STUDENT' && (
                    <td className="py-3">
                      <div className="font-medium text-main">{fee.first_name} {fee.last_name}</div>
                      <div className="text-xs text-secondary">{fee.enrollment_number}</div>
                    </td>
                  )}
                  <td className="font-medium text-main py-3">{fee.feeType || fee.fee_type}</td>
                  <td className="py-3 text-main">
                    <div>{fee.academicYear || fee.academic_year}</div>
                    <div className="text-xs text-secondary">Sem {fee.semester}</div>
                  </td>
                  <td className="font-semibold text-main py-3">₹{(fee.totalAmount || fee.total_amount)?.toLocaleString()}</td>
                  <td className="text-success font-medium py-3">₹{(fee.paidAmount || fee.paid_amount || 0)?.toLocaleString()}</td>
                  <td className="text-main py-3">{formatDate(fee.dueDate || fee.due_date)}</td>
                  <td className="py-3">
                    <span className={`badge ${statusBadge(fee.status)}`}>{fee.status}</span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td className="py-3">
                      <button className="text-primary hover:text-primary-dark font-medium text-sm p-1" onClick={() => openModal(fee)}>
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {fees.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 9 : (user?.role === 'STUDENT' ? 7 : 8)} className="text-center py-16 text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <Banknote size={48} className="text-border mb-4" />
                      <p>No fee records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-main">{editingId ? 'Update Payment' : 'Record Fee'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <form id="fee-form" className="space-y-4" onSubmit={handleSave}>
                {!editingId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="form-label text-main">Student *</label>
                      <select name="student_id" defaultValue={formData.student_id} required className="form-control bg-background text-main border-border">
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNumber})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-main">Academic Year *</label>
                      <input type="text" name="academic_year" defaultValue={formData.academic_year} required placeholder="2025-26" className="form-control bg-background text-main border-border" />
                    </div>
                    <div>
                      <label className="form-label text-main">Semester *</label>
                      <input type="number" name="semester" defaultValue={formData.semester} required min="1" max="12" className="form-control bg-background text-main border-border" />
                    </div>
                    <div>
                      <label className="form-label text-main">Fee Type *</label>
                      <select name="fee_type" defaultValue={formData.fee_type} required className="form-control bg-background text-main border-border">
                        <option value="Tuition">Tuition Fee</option>
                        <option value="Hostel">Hostel Fee</option>
                        <option value="Library">Library Fee</option>
                        <option value="Exam">Examination Fee</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-main">Total Amount (₹) *</label>
                      <input type="number" name="total_amount" defaultValue={formData.total_amount} required min="0" className="form-control bg-background text-main border-border" />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
                  <div>
                    <label className="form-label text-main">Paid Amount (₹)</label>
                    <input type="number" name="paid_amount" defaultValue={formData.paid_amount} min="0" className="form-control bg-background text-main border-border" />
                  </div>
                  <div>
                    <label className="form-label text-main">Due Date</label>
                    <input type="date" name="due_date" defaultValue={formData.due_date} className="form-control bg-background text-main border-border" />
                  </div>
                  <div>
                    <label className="form-label text-main">Payment Mode</label>
                    <select name="payment_mode" defaultValue={formData.payment_mode} className="form-control bg-background text-main border-border">
                      <option value="">Pending / Not Applicable</option>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="ONLINE">Online Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-main">Receipt Number</label>
                    <input type="text" name="receipt_number" defaultValue={formData.receipt_number} className="form-control bg-background text-main border-border" />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label text-main">Remarks / Notes</label>
                    <input type="text" name="remarks" defaultValue={formData.remarks} className="form-control bg-background text-main border-border" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-background flex justify-end space-x-3 rounded-b-xl">
              <button onClick={closeModal} type="button" className="btn btn-secondary text-main border border-border">Cancel</button>
              <button type="submit" form="fee-form" disabled={saving} className="btn btn-primary flex items-center justify-center min-w-[120px]">
                {saving ? (
                  <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</>
                ) : (
                  <><Check size={16} className="mr-2" /> {editingId ? 'Update Record' : 'Save Record'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
