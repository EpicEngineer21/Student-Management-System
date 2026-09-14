'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function DsaAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/dashboard/dsa');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="spinner mt-10 mx-auto"></div>;
  if (!data) return <div>Failed to load DSA analytics</div>;

  const StatBox = ({ title, value, subtitle }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
      <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Data Structures & Algorithms</h2>
          <p className="text-gray-500 text-sm">Live analytics of internal engineering systems</p>
        </div>
        <button onClick={loadData} disabled={refreshing} className="btn btn-secondary">
          {refreshing ? 'Refreshing...' : '🔄 Run Demo'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sorting */}
        <div className="card">
          <div className="card-header border-b-2 border-blue-500">
            <h3 className="card-title font-mono">1. Sorting (MergeSort / QuickSort / BubbleSort)</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">Sorting {data.sorting.mergeSort.inputSize} student records in memory.</p>
            <div className="grid grid-cols-3 gap-4">
              <StatBox title="Merge Sort" value={data.sorting.mergeSort.comparisons} subtitle={`cmps / ${data.sorting.mergeSort.complexity}`} />
              <StatBox title="Quick Sort" value={data.sorting.quickSort.comparisons} subtitle={`cmps / ${data.sorting.quickSort.complexity}`} />
              <StatBox title="Bubble Sort" value={data.sorting.bubbleSort.comparisons} subtitle={`cmps / (first 20 only)`} />
            </div>
          </div>
        </div>

        {/* Searching */}
        <div className="card">
          <div className="card-header border-b-2 border-green-500">
            <h3 className="card-title font-mono">2. Searching (Binary vs Linear)</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">Finding middle student enrollment ID.</p>
            <div className="grid grid-cols-2 gap-4">
              <StatBox title="Binary Search" value={`${data.searching.binarySearch.steps} steps`} subtitle={data.searching.binarySearch.complexity} />
              <StatBox title="Linear Search" value={`${data.searching.linearSearch.steps} steps`} subtitle={data.searching.linearSearch.complexity} />
            </div>
          </div>
        </div>

        {/* HashTable */}
        <div className="card">
          <div className="card-header border-b-2 border-purple-500">
            <h3 className="card-title font-mono">3. HashTable (Session Cache)</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">O(1) lookups for authentication caching.</p>
            <div className="grid grid-cols-3 gap-4">
              <StatBox title="Buckets" value={data.hashTable.stats.buckets} subtitle="Array Size" />
              <StatBox title="Entries" value={data.hashTable.stats.entries} subtitle="Stored" />
              <StatBox title="Load Factor" value={data.hashTable.stats.loadFactor} subtitle="Entries / Buckets" />
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="card">
          <div className="card-header border-b-2 border-red-500">
            <h3 className="card-title font-mono">4. Graph (BFS / DFS Traversal)</h3>
          </div>
          <div className="card-body overflow-hidden">
            <p className="text-sm text-gray-600 mb-2">Dept → Course → Subject Relationship Traversal</p>
            <p className="text-xs font-mono text-gray-500 truncate">BFS: {data.graph.bfsOrder.join(' → ')}</p>
            <p className="text-xs font-mono text-gray-500 truncate mt-2">DFS: {data.graph.dfsOrder.join(' → ')}</p>
          </div>
        </div>

        {/* Queue & Stack */}
        <div className="card lg:col-span-2 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-6">
            <h3 className="font-mono font-semibold text-lg border-b-2 border-yellow-500 pb-2 mb-4">5. Queue (FIFO)</h3>
            <p className="text-sm text-gray-600 mb-2">Task Pipeline</p>
            <div className="text-xs font-mono bg-gray-50 p-2 rounded">
              <div>Processed: {data.queue.processed}</div>
              <div>Pending: {data.queue.size} tasks</div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-mono font-semibold text-lg border-b-2 border-pink-500 pb-2 mb-4">6. Stack (LIFO)</h3>
            <p className="text-sm text-gray-600 mb-2">Navigation History</p>
            <div className="text-xs font-mono bg-gray-50 p-2 rounded">
              <div>Top: {data.stack.top}</div>
              <div>Depth: {data.stack.size}</div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-mono font-semibold text-lg border-b-2 border-orange-500 pb-2 mb-4">7. Priority Queue</h3>
            <p className="text-sm text-gray-600 mb-2">Notices by Urgency</p>
            <div className="text-xs font-mono bg-gray-50 p-2 rounded">
              <div>Next (Highest):</div>
              <div className="text-danger truncate mt-1">{data.priorityQueue.next}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
