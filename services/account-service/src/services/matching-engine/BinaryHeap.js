class BinaryHeap {
  constructor(compare) {
    this.heap = [];
    this.compare = compare;
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  size() {
    return this.heap.length;
  }

  left(i) {
    return 2 * i + 1;
  }

  right(i) {
    return 2 * i + 2;
  }

  isempty() {
    return this.heap.length === 0;
  }

  insert(i) {
    this.heap.push(i);
    this.heapUp(this.heap.length - 1);
  }

  heapUp(i) {
    while (i > 0) {
      const p = this.parent(i);

      if (this.compare(this.heap[i], this.heap[p]) <= 0) {
        break;
      }
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  max_heap() {
    if (this.isempty()) {
      return null;
    }
    return this.heap[0];
  }

  heapDown(i) {
    const n = this.heap.length;

    while (true) {
      let max = i;
      const left = this.left(i);
      const right = this.right(i);
      if (left < n && this.compare(this.heap[left], this.heap[max]) > 0) {
        max = left;
      }
      if (right < n && this.compare(this.heap[right], this.heap[max]) > 0) {
        max = right;
      }

      if (max === i) {
        break;
      }

      [this.heap[max], this.heap[i]] = [this.heap[i], this.heap[max]];
      i = max;
    }
  }

  deleteMax() {
    if (this.isempty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const max_v = this.heap[0];

    this.heap[0] = this.heap.pop();

    this.heapDown(0);

    return max_v;
  }
}

module.exports = BinaryHeap;
