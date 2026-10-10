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

  isempty() {
    return this.orders.isempty();
  }

  size() {
    return this.orders.length();
  }
}

module.exports = PriceLevel;
