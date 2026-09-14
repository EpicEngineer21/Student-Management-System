'use strict';
/**
 * Binary Search — O(log n)
 * Used for sorted student ID/enrollment lookups
 */
function binarySearch(arr, target, keyFn = x => x) {
  let lo = 0, hi = arr.length - 1, comparisons = 0;
  while (lo <= hi) {
    comparisons++;
    const mid = (lo + hi) >> 1;
    const val = keyFn(arr[mid]);
    if (val === target) return { index: mid, found: true, comparisons };
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return { index: -1, found: false, comparisons };
}

function linearSearch(arr, target, keyFn = x => x) {
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    if (keyFn(arr[i]) === target) return { index: i, found: true, comparisons };
  }
  return { index: -1, found: false, comparisons };
}

module.exports = { binarySearch, linearSearch };
