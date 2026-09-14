'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadNotices();
  }, [category]);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notices${category ? `?category=${category}` : ''}`);
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Notice Board</h2>
          <p className="text-gray-500 text-sm">Official announcements and alerts</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ New Notice</button>
        )}
      </div>

      <div className="flex space-x-2 border-b border-gray-200 pb-4">
        {['', 'Examination', 'Holiday', 'Fee', 'General', 'Event'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-light/70 flex items-center justify-center z-10">
            <div className="spinner"></div>
          </div>
        )}
        
        {notices.map((notice) => (
          <div key={notice._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className={`h-2 ${notice.priority === 'HIGH' ? 'bg-red-500' : notice.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{notice.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(notice.priority)}`}>
                  {notice.priority}
                </span>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2 leading-tight">{notice.title}</h3>
              <p className="text-gray-600 text-sm flex-1">{notice.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                <span>{formatDate(notice.createdAt)}</span>
                <span>By Admin</span>
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-gray-500">No notices found.</div>
        )}
      </div>
      
      {/* DSA explanation banner */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start space-x-3 mt-8">
        <span className="text-xl">🧠</span>
        <div>
          <h4 className="text-sm font-bold text-purple-900">Powered by PriorityQueue</h4>
          <p className="text-xs text-purple-700 mt-1">
            This notice board sorts announcements in real-time using a <strong>Min-Heap Priority Queue</strong> on the backend. 
            HIGH priority items are dequeued first, bypassing standard chronological sorting.
          </p>
        </div>
      </div>
    </div>
  );
}
