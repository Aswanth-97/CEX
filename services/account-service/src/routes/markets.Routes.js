const express = require("express");
const router = express.Router();
const marketControllers = require("../controllers/market.controllers");
const validator = require("../middleware/validate");
const verifyAccessToken = require("../middleware/auth.middleware");
const { ROLES_LIST, verifyRoles } = require("../middleware/roles.middleware");
const {
  getMarketByIdSchema,
  getMarketBySymbolSchema,
  createMarketSchema,
} = require("../validators/market.schema");

router
  .route("/")
  .get(marketControllers.getAllMarkets)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(createMarketSchema, "body"),
    marketControllers.createMarket,
  );

router
  .route("/symbol/:marketSymbol")
  .get(
    validator.validate(getMarketBySymbolSchema, "params"),
    marketControllers.getMarketBySymbol,
  );

router
  .route("/:marketId")
  .get(
    validator.validate(getMarketByIdSchema, "params"),
    marketControllers.getMarketById,
  );

module.exports = router;
