const express = require("express");
const router = express.Router();
const orderBookControllers = require("../controllers/orderbook.controllers");
const validator = require("../middleware/validate");
const verifyAccessToken = require("../middleware/auth.middleware");
const { ROLES_LIST, verifyRoles } = require("../middleware/roles.middleware");
const { getOrderBookSchema } = require("../validators/orderBook.schema");

router
  .route("/")
  .get(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(getOrderBookSchema, "query"),
    orderBookControllers.getOrderBookOrders,
  );

module.exports = router;
