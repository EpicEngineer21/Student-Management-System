'use strict';
/**
 * Stack — LIFO
 * Used for: Admin undo history, recently visited pages
 */
class Stack {
  constructor(maxSize = 100) { this.items = []; this.maxSize = maxSize; }
  push(item) {
    if (this.items.length >= this.maxSize) this.items.shift(); // drop oldest
    this.items.push(item);
    return this;
  }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
  toArray() { return [...this.items].reverse(); }
  clear() { this.items = []; }
}
module.exports = Stack;
