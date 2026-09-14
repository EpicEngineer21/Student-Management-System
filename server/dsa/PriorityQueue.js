'use strict';
/**
 * Priority Queue (Min-Heap by default)
 * Used for: Notice priority ordering, urgent task handling
 */
class PriorityQueue {
  constructor(comparator = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.comparator = comparator;
  }
  enqueue(item, priority = 0) {
    this.heap.push({ item, priority });
    this._bubbleUp(this.heap.length - 1);
    return this;
  }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) { this.heap[0] = last; this._sinkDown(0); }
    return top.item;
  }
  peek() { return this.heap[0]?.item; }
  isEmpty() { return this.heap.length === 0; }
  size() { return this.heap.length; }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.comparator(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }
  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.comparator(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.comparator(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest !== i) { [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]; i = smallest; }
      else break;
    }
  }
  toArray() { return [...this.heap].map(e => e.item); }
}
module.exports = PriorityQueue;
