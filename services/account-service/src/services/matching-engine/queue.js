class Queue {
  constructor() {
    this.queue = [];
  }

  isempty() {
    return this.queue.length === 0;
  }

  enqueue(i) {
    this.queue.push(i);
  }

  dequeue() {
    if (this.isempty()) {
      return null;
    }
    return this.queue.shift();
  }

  length() {
    return this.queue.length;
  }

  peek() {
    if (this.isempty()) {
      return null;
    }
    return this.queue[0];
  }
}

module.exports = Queue;
