'use strict';
/**
 * Hash Table — O(1) average lookup
 * Used for: Student ID → Student, Enrollment → Student, Session cache
 */
class HashTable {
  constructor(size = 1024) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
    this.count = 0;
  }
  _hash(key) {
    let h = 0;
    const s = String(key);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % this.size;
    return h;
  }
  set(key, value) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) { existing[1] = value; } else { bucket.push([key, value]); this.count++; }
  }
  get(key) {
    const bucket = this.buckets[this._hash(key)];
    const pair = bucket.find(([k]) => k === key);
    return pair ? pair[1] : undefined;
  }
  delete(key) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const i = bucket.findIndex(([k]) => k === key);
    if (i !== -1) { bucket.splice(i, 1); this.count--; return true; }
    return false;
  }
  has(key) { return this.get(key) !== undefined; }
  keys() { return this.buckets.flat().map(([k]) => k); }
  values() { return this.buckets.flat().map(([, v]) => v); }
  entries() { return this.buckets.flat(); }
  getLoadFactor() { return this.count / this.size; }
  getStats() { return { size: this.size, count: this.count, loadFactor: this.getLoadFactor().toFixed(3) }; }
}
module.exports = HashTable;
