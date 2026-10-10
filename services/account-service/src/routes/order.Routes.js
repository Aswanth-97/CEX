const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/order.controllers");
const validator = require("../middleware/validate");
const verifyAccessToken = require("../middleware/auth.middleware");
const { ROLES_LIST, verifyRoles } = require("../middleware/roles.middleware");
const {
  createOrderSchema,
  getOrderByIdSchema,
  getOrdersByAccountIdSchema,
} = require("../validators/order.schema");

router
  .route("/")
  .get(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    orderControllers.getAllOrders,
  )
  .post(
    verifyAccessToken,
    validator.validate(createOrderSchema, "body"),
    orderControllers.createOrder,
  );

router
  .route("/account/:accountId")
  .get(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(getOrdersByAccountIdSchema, "params"),
    orderControllers.getOrdersByAccountId,
  );

router
  .route("/:orderId")
  .get(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(getOrderByIdSchema, "params"),
    orderControllers.getOrderById,
  );

router
  .route("/:orderId/cancel")
  .patch(
    verifyAccessToken,
    validator.validate(getOrderByIdSchema, "params"),
    orderControllers.cancelOrder,
  );

module.exports = router;
