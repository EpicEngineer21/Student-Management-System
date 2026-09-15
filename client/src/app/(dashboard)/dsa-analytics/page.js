'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Network, Database, ListOrdered, Braces, RefreshCw, Layers, SortAsc, LayoutList, Search } from 'lucide-react';

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
    <div className="bg-background/50 p-4 rounded-lg border border-border">
      <div className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">{title}</div>
      <div className="text-2xl font-bold text-main font-mono mb-1">{value}</div>
      <div className="text-xs text-secondary">{subtitle}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-main tracking-tight">System Data Structures</h2>
          <p className="text-secondary text-sm mt-1">Technical analytics of internal engineering systems</p>
        </div>
        <button onClick={loadData} disabled={refreshing} className="btn btn-secondary flex items-center">
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sorting */}
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex items-center space-x-3 py-3 px-5">
            <SortAsc size={18} className="text-primary" />
            <h3 className="card-title text-base font-semibold">Sorting Performance</h3>
          </div>
          <div className="card-body p-5">
            <p className="text-sm text-secondary mb-5">Sorting <span className="font-mono bg-gray-100 px-1 rounded text-main">{data.sorting.mergeSort.inputSize}</span> student records in memory.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatBox title="MergeSort" value={data.sorting.mergeSort.comparisons} subtitle={`Complexity: ${data.sorting.mergeSort.complexity}`} />
              <StatBox title="QuickSort" value={data.sorting.quickSort.comparisons} subtitle={`Complexity: ${data.sorting.quickSort.complexity}`} />
              <StatBox title="BubbleSort" value={data.sorting.bubbleSort.comparisons} subtitle={`Limit: 20 records`} />
            </div>
          </div>
        </div>

        {/* Searching */}
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex items-center space-x-3 py-3 px-5">
            <Search size={18} className="text-emerald-600" />
            <h3 className="card-title text-base font-semibold">Search Operations</h3>
          </div>
          <div className="card-body p-5">
            <p className="text-sm text-secondary mb-5">Execution steps to find median entity ID.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBox title="Binary Search" value={data.searching.binarySearch.steps} subtitle={`Steps / ${data.searching.binarySearch.complexity}`} />
              <StatBox title="Linear Search" value={data.searching.linearSearch.steps} subtitle={`Steps / ${data.searching.linearSearch.complexity}`} />
            </div>
          </div>
        </div>

        {/* HashTable */}
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex items-center space-x-3 py-3 px-5">
            <Database size={18} className="text-purple-600" />
            <h3 className="card-title text-base font-semibold">Hash Table (Cache)</h3>
          </div>
          <div className="card-body p-5">
            <p className="text-sm text-secondary mb-5">Auth session memory storage distribution.</p>
            <div className="grid grid-cols-3 gap-4">
              <StatBox title="Buckets" value={data.hashTable.stats.buckets} subtitle="Capacity" />
              <StatBox title="Entries" value={data.hashTable.stats.entries} subtitle="Stored" />
              <StatBox title="Load Factor" value={data.hashTable.stats.loadFactor} subtitle="Entries/Buckets" />
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="card">
          <div className="card-header bg-background/50 border-b border-border flex items-center space-x-3 py-3 px-5">
            <Network size={18} className="text-amber-600" />
            <h3 className="card-title text-base font-semibold">Graph Traversal</h3>
          </div>
          <div className="card-body p-5">
            <p className="text-sm text-secondary mb-4">Dept → Course → Subject topological paths.</p>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase text-secondary mb-1">BFS Traversal</div>
                <div className="text-xs font-mono bg-slate-800 text-slate-300 p-3 rounded-lg overflow-x-auto whitespace-nowrap">
                  {data.graph.bfsOrder.join(' → ')}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-secondary mb-1">DFS Traversal</div>
                <div className="text-xs font-mono bg-slate-800 text-slate-300 p-3 rounded-lg overflow-x-auto whitespace-nowrap">
                  {data.graph.dfsOrder.join(' → ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queues & Stacks */}
        <div className="card lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ListOrdered size={16} className="text-blue-500" />
                <h3 className="font-semibold text-main text-sm">Queue (FIFO)</h3>
              </div>
              <p className="text-xs text-secondary mb-4">Sequential task pipeline</p>
              <div className="space-y-2 text-sm font-mono bg-background p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <span className="text-secondary">Processed:</span>
                  <span className="text-main">{data.queue.processed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Pending:</span>
                  <span className="text-main">{data.queue.size}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Layers size={16} className="text-pink-500" />
                <h3 className="font-semibold text-main text-sm">Stack (LIFO)</h3>
              </div>
              <p className="text-xs text-secondary mb-4">Navigation routing history</p>
              <div className="space-y-2 text-sm font-mono bg-background p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <span className="text-secondary">Top:</span>
                  <span className="text-main truncate max-w-[120px]">{data.stack.top}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Depth:</span>
                  <span className="text-main">{data.stack.size}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <LayoutList size={16} className="text-orange-500" />
                <h3 className="font-semibold text-main text-sm">Priority Queue</h3>
              </div>
              <p className="text-xs text-secondary mb-4">Notice dissemination (Min-Heap)</p>
              <div className="space-y-2 text-sm font-mono bg-background p-3 rounded-md border border-border">
                <div className="text-secondary">Next Node:</div>
                <div className="text-danger truncate font-medium">{data.priorityQueue.next}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
