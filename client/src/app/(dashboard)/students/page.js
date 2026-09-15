'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Search, UserPlus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Activity, Filter, Check, Users } from 'lucide-react';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('firstName');
  const [algorithm, setAlgorithm] = useState('quicksort');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  const [metrics, setMetrics] = useState({ comparisons: 0, ms: 0 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const openModal = (student = null) => {
    if (student) {
      setEditingId(student._id);
      setFormData({
        first_name: student.firstName,
        last_name: student.lastName,
        email: student.user?.email || '',
        phone: student.phone || '',
        enrollment_number: student.enrollmentNumber,
        roll_number: student.rollNumber,
        current_semester: student.currentSemester || 1,
        gender: student.gender || ''
      });
    } else {
      setEditingId(null);
      setFormData({});
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
        await api.put(`/students/${editingId}`, data);
      } else {
        await api.post('/students', data);
      }
      closeModal();
      loadStudents();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate this student?')) {
      try {
        await api.delete(`/students/${id}`);
        loadStudents();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, sortBy, algorithm, page]);

  const loadStudents = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const skip = (page - 1) * limit;
      const res = await api.get(`/students?search=${search}&sortBy=${sortBy}&algorithm=${algorithm}&skip=${skip}&limit=${limit}`);
      setStudents(res.data);
      setTotal(res.pagination.total);
      setMetrics({
        comparisons: res.metadata.comparisons,
        ms: (performance.now() - start).toFixed(1)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-main tracking-tight">Students</h2>
          <p className="text-secondary text-sm mt-1">Manage and view student records</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <UserPlus size={16} className="mr-2" />
            Add Student
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header bg-background/50 flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary">
              <Search size={16} />
            </span>
            <input 
              type="text"
              placeholder="Search by name, roll, or ID..."
              className="pl-9 form-control bg-surface"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-secondary" />
              <label className="text-sm font-medium text-main">Sort By:</label>
              <select className="form-control w-auto bg-surface py-1.5 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="enrollmentNumber">Enrollment ID</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pl-3 border-l border-border">
              <Activity size={14} className="text-secondary" />
              <label className="text-sm font-medium text-main">DSA Engine:</label>
              <select className="form-control w-auto bg-surface py-1.5 text-sm text-primary font-medium" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setPage(1); }}>
                <option value="quicksort">QuickSort</option>
                <option value="mergesort">MergeSort</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Subtle DSA Performance Strip */}
        <div className="bg-slate-50 px-6 py-2 border-b border-border flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Perf Info</span>
            <span>Sorted {total} records using <strong>{algorithm === 'quicksort' ? 'QuickSort' : 'MergeSort'}</strong> in {metrics.ms}ms ({metrics.comparisons} comparisons)</span>
          </div>
        </div>

        <div className="table-wrapper relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="spinner"></div>
            </div>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>Enrollment No</th>
                <th>Name</th>
                <th>Course</th>
                <th>Sem</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="font-mono text-xs text-secondary">{student.enrollmentNumber}</td>
                  <td>
                    <div className="font-medium text-main">{student.firstName} {student.lastName}</div>
                    <div className="text-xs text-secondary">{student.rollNumber}</div>
                  </td>
                  <td>
                    <div className="font-medium text-main">{student.course?.code || '—'}</div>
                    <div className="text-xs text-secondary">{student.department?.code || ''}</div>
                  </td>
                  <td>{student.currentSemester}</td>
                  <td>
                    <div className="text-sm text-main">{student.phone || '—'}</div>
                    <div className="text-xs text-secondary truncate w-32">{student.user?.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(student.status)}`}>{student.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 text-secondary hover:text-primary rounded-md hover:bg-blue-50 transition-colors" onClick={() => openModal(student)}>
                        <Edit2 size={16} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button className="p-1.5 text-secondary hover:text-danger rounded-md hover:bg-red-50 transition-colors" onClick={() => handleDelete(student._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-secondary">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users size={32} className="text-slate-300" />
                      <p>No students found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer flex justify-between items-center bg-surface">
          <div className="text-sm text-secondary">
            Showing <span className="font-medium text-main">{(page - 1) * limit + 1}</span> to <span className="font-medium text-main">{Math.min(page * limit, total)}</span> of <span className="font-medium text-main">{total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="btn btn-secondary px-3 py-1.5 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} className="mr-1" />
              Prev
            </button>
            <button 
              className="btn btn-secondary px-3 py-1.5 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= totalPages || total === 0}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nav/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="text-lg font-semibold text-main">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={closeModal} className="text-secondary hover:text-main transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="student-form" className="space-y-6" onSubmit={handleSave}>
                
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-semibold text-main uppercase tracking-wider mb-4 border-b border-border pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">First Name *</label>
                      <input type="text" name="first_name" defaultValue={formData.first_name} required className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Last Name *</label>
                      <input type="text" name="last_name" defaultValue={formData.last_name} required className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Email Address *</label>
                      <input type="email" name="email" defaultValue={formData.email} required disabled={!!editingId} className="form-control disabled:bg-gray-100 disabled:text-secondary disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="form-label">Phone Number</label>
                      <input type="text" name="phone" defaultValue={formData.phone} className="form-control" />
                    </div>
                    <div>
                      <label className="form-label">Gender</label>
                      <select name="gender" defaultValue={formData.gender} className="form-control">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-sm font-semibold text-main uppercase tracking-wider mb-4 border-b border-border pb-2">Academic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Enrollment Number *</label>
                      <input type="text" name="enrollment_number" defaultValue={formData.enrollment_number} required className="form-control font-mono text-sm" />
                    </div>
                    <div>
                      <label className="form-label">Roll Number *</label>
                      <input type="text" name="roll_number" defaultValue={formData.roll_number} required className="form-control font-mono text-sm" />
                    </div>
                    <div>
                      <label className="form-label">Current Semester</label>
                      <input type="number" name="current_semester" defaultValue={formData.current_semester} min="1" max="10" className="form-control" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end space-x-3">
              <button onClick={closeModal} type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" form="student-form" disabled={saving} className="btn btn-primary flex items-center">
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2 border-2 border-white/20 border-l-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Save Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
