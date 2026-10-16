class Queue {
  constructor() {
    this.queue = [];
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  enqueue(i) {
    this.queue.push(i);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue.shift();
  }

  length() {
    return this.queue.length;
  }

  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue[0];
  }
}

module.exports = Queue;
