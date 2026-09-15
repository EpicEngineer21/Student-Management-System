'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

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
          <h2 className="text-2xl font-bold text-dark">Students</h2>
          <p className="text-gray-500 text-sm">Manage student records</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Student</button>
        )}
      </div>

      <div className="card">
        <div className="card-header bg-gray-50 flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 border-b">
          <div className="flex-1 w-full relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="Search by name, roll, or ID..."
              className="pl-10 form-control"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort By:</label>
            <select className="form-control w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="enrollmentNumber">Enrollment ID</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 border-l pl-4">
            <label className="text-sm font-medium text-gray-700">DSA Engine:</label>
            <select className="form-control w-auto text-primary font-semibold" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setPage(1); }}>
              <option value="quicksort">Quick Sort</option>
              <option value="mergesort">Merge Sort</option>
            </select>
          </div>
        </div>
        
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex items-center justify-between text-sm">
          <div>
            <span className="text-blue-800 font-semibold">DSA Stats:</span> 
            <span className="text-blue-600 ml-2">Sorted using {algorithm === 'quicksort' ? 'QuickSort' : 'MergeSort'} in {metrics.ms}ms ({metrics.comparisons} comparisons)</span>
          </div>
          <div className="text-blue-800 font-semibold">Total Records: {total}</div>
        </div>

        <div className="table-wrapper relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
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
                  <td className="font-mono text-sm">{student.enrollmentNumber}</td>
                  <td>
                    <div className="font-medium text-dark">{student.firstName} {student.lastName}</div>
                    <div className="text-xs text-gray-500">{student.rollNumber}</div>
                  </td>
                  <td>
                    <div>{student.course?.code || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{student.department?.code || ''}</div>
                  </td>
                  <td>{student.currentSemester}</td>
                  <td>
                    <div>{student.phone}</div>
                    <div className="text-xs text-gray-500 truncate w-32">{student.user?.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(student.status)}`}>{student.status}</span>
                  </td>
                  <td>
                    <button className="text-primary hover:text-primary-dark font-medium text-sm mr-3" onClick={() => openModal(student)}>Edit</button>
                    {user?.role === 'ADMIN' && (
                      <button className="text-danger hover:text-red-700 font-medium text-sm" onClick={() => handleDelete(student._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">No students found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn btn-secondary px-3 py-1"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary px-3 py-1"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="student-form" className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input type="text" name="first_name" defaultValue={formData.first_name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input type="text" name="last_name" defaultValue={formData.last_name} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input type="email" name="email" defaultValue={formData.email} required disabled={!!editingId} className="form-control disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input type="text" name="phone" defaultValue={formData.phone} className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Enrollment Number *</label>
                    <input type="text" name="enrollment_number" defaultValue={formData.enrollment_number} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Roll Number *</label>
                    <input type="text" name="roll_number" defaultValue={formData.roll_number} required className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Semester</label>
                    <input type="number" name="current_semester" defaultValue={formData.current_semester} min="1" max="8" className="form-control" />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select name="gender" defaultValue={formData.gender} className="form-control">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
              <button type="submit" form="student-form" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
