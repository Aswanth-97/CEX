const express = require("express");
const router = express.Router();
const validator = require("../middleware/validate");
const assetNetworkControllers = require("../controllers/assetNetwork.controllers");
const { verifyRoles, ROLES_LIST } = require("../middleware/roles.middleware");
const {
  createAssetNetworkSchema,
  updateAssetNetworkSchema,
  getAssetNetworkByIdSchema,
} = require("../validators/asset.schema");
const verifyAccessToken = require("../middleware/auth.middleware");

router
  .route("/")
  .get(assetNetworkControllers.getAllAssetNetworks)
  .post(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(createAssetNetworkSchema, "body"),
    assetNetworkControllers.createAssetNetwork,
  );

router
  .route("/:assetNetworkId")
  .get(
    validator.validate(getAssetNetworkByIdSchema, "params"),
    assetNetworkControllers.getAssetNetworkById,
  )
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(getAssetNetworkByIdSchema, "params"),
    validator.validate(updateAssetNetworkSchema, "body"),
    assetNetworkControllers.updateAssetNetwork,
  );

module.exports = router;
