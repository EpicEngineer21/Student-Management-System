'use strict';
/**
 * Doubly Linked List — Used for recent activity history in admin dashboard
 */
class Node { constructor(data) { this.data = data; this.next = null; this.prev = null; } }
class LinkedList {
  constructor(maxSize = 50) { this.head = null; this.tail = null; this.size = 0; this.maxSize = maxSize; }
  prepend(data) {
    const node = new Node(data);
    if (!this.head) { this.head = this.tail = node; }
    else { node.next = this.head; this.head.prev = node; this.head = node; }
    this.size++;
    if (this.size > this.maxSize) this._removeTail();
    return this;
  }
  append(data) {
    const node = new Node(data);
    if (!this.tail) { this.head = this.tail = node; }
    else { this.tail.next = node; node.prev = this.tail; this.tail = node; }
    this.size++;
    if (this.size > this.maxSize) this._removeHead();
    return this;
  }
  _removeHead() { if (!this.head) return; this.head = this.head.next; if (this.head) this.head.prev = null; else this.tail = null; this.size--; }
  _removeTail() { if (!this.tail) return; this.tail = this.tail.prev; if (this.tail) this.tail.next = null; else this.head = null; this.size--; }
  toArray() { const arr = []; let c = this.head; while (c) { arr.push(c.data); c = c.next; } return arr; }
  getSize() { return this.size; }
}
module.exports = LinkedList;
