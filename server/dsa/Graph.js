'use strict';
/**
 * Graph using Adjacency List — represents academic relationships
 * Department → Courses → Subjects → Teachers
 */
class Graph {
  constructor(directed = true) { this.adj = new Map(); this.directed = directed; }
  addVertex(v) { if (!this.adj.has(v)) this.adj.set(v, []); }
  addEdge(u, v, weight = 1) {
    this.addVertex(u); this.addVertex(v);
    this.adj.get(u).push({ node: v, weight });
    if (!this.directed) this.adj.get(v).push({ node: u, weight });
  }
  getNeighbors(v) { return this.adj.get(v) || []; }
  getVertices() { return [...this.adj.keys()]; }
  hasVertex(v) { return this.adj.has(v); }

  /** BFS — returns visited order */
  bfs(start) {
    if (!this.adj.has(start)) return [];
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    while (queue.length) {
      const v = queue.shift();
      order.push(v);
      for (const { node } of this.adj.get(v)) {
        if (!visited.has(node)) { visited.add(node); queue.push(node); }
      }
    }
    return order;
  }

  /** DFS — returns visited order */
  dfs(start) {
    if (!this.adj.has(start)) return [];
    const visited = new Set();
    const order = [];
    const recurse = (v) => {
      visited.add(v); order.push(v);
      for (const { node } of this.adj.get(v)) if (!visited.has(node)) recurse(node);
    };
    recurse(start);
    return order;
  }

  toJSON() {
    const obj = {};
    for (const [k, v] of this.adj) obj[k] = v;
    return obj;
  }
}

module.exports = Graph;
