'use strict';
/**
 * Queue — FIFO
 * Used for: Admission processing, notification delivery
 */
class Queue {
  constructor() { this.items = []; this.head = 0; }
  enqueue(item) { this.items.push(item); return this; }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    this.head++;
    if (this.head > this.items.length / 2) { this.items = this.items.slice(this.head); this.head = 0; }
    return item;
  }
  peek() { return this.items[this.head]; }
  isEmpty() { return this.head >= this.items.length; }
  size() { return this.items.length - this.head; }
  toArray() { return this.items.slice(this.head); }
  clear() { this.items = []; this.head = 0; }
}
module.exports = Queue;
