const orderService = require("../services/order.service");

const getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const result = await orderService.getOrderById({
      orderId,
      requestId: req.id,
    });
    if (!result) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getOrdersByAccountId = async (req, res, next) => {
  const { accountId } = req.params;
  try {
    const result = await orderService.getOrdersByAccountId({
      accountId,
      requestId: req.id,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  const { marketId, clientOrderId, side, orderType, price, quantity } =
    req.body;

  try {
    const result = await orderService.createOrder({
      marketId,
      clientOrderId,
      side,
      orderType,
      price,
      quantity,
      userId: req.user.userId,
      requestId: req.id,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const result = await orderService.cancelOrder({
      orderId,
      userId: req.user.userId,
      requestId: req.id,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders({ requestId: req.id });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrderById,
  getOrdersByAccountId,
  createOrder,
  getAllOrders,
  cancelOrder,
};
