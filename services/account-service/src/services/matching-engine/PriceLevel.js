const Queue = require("./queue");

class PriceLevel {
  constructor(price) {
    this.price = price;
    this.orders = new Queue();
  }

  addOrder(order) {
    this.orders.enqueue(order);
  }

  getFirstOrder() {
    return this.orders.peek();
  }

  removeFirstOrder() {
    return this.orders.dequeue();
  }

  isEmpty() {
    return this.orders.isEmpty();
  }

  size() {
    return this.orders.length();
  }
}

module.exports = PriceLevel;
