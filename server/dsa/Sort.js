'use strict';
/**
 * Merge Sort — O(n log n) — used for large student list sorting
 */
function mergeSort(arr, keyFn = x => x) {
  let comparisons = 0;
  function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (keyFn(left[i]) <= keyFn(right[j])) result.push(left[i++]);
      else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
  function sort(a) {
    if (a.length <= 1) return a;
    const mid = a.length >> 1;
    return merge(sort(a.slice(0, mid)), sort(a.slice(mid)));
  }
  const sorted = sort([...arr]);
  return { sorted, comparisons };
}

/**
 * Quick Sort — O(n log n) avg
 */
function quickSort(arr, keyFn = x => x) {
  let comparisons = 0;
  function sort(a, lo, hi) {
    if (lo >= hi) return;
    let pivot = keyFn(a[hi]), i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      if (keyFn(a[j]) <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; }
    }
    [a[i+1], a[hi]] = [a[hi], a[i+1]];
    const p = i + 1;
    sort(a, lo, p - 1);
    sort(a, p + 1, hi);
  }
  const sorted = [...arr];
  sort(sorted, 0, sorted.length - 1);
  return { sorted, comparisons };
}

/**
 * Bubble Sort — O(n²) — for demonstration
 */
function bubbleSort(arr, keyFn = x => x) {
  let comparisons = 0;
  const sorted = [...arr];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - i - 1; j++) {
      comparisons++;
      if (keyFn(sorted[j]) > keyFn(sorted[j+1])) [sorted[j], sorted[j+1]] = [sorted[j+1], sorted[j]];
    }
  }
  return { sorted, comparisons };
}

/**
 * Selection Sort — O(n²)
 */
function selectionSort(arr, keyFn = x => x) {
  let comparisons = 0;
  const sorted = [...arr];
  for (let i = 0; i < sorted.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < sorted.length; j++) {
      comparisons++;
      if (keyFn(sorted[j]) < keyFn(sorted[minIdx])) minIdx = j;
    }
    if (minIdx !== i) [sorted[i], sorted[minIdx]] = [sorted[minIdx], sorted[i]];
  }
  return { sorted, comparisons };
}

module.exports = { mergeSort, quickSort, bubbleSort, selectionSort };
