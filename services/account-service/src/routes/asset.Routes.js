const express = require("express");
const router = express.Router();
const assetController = require("../controllers/asset.controllers");
const {
  getAssetByIdSchema,
  createAssetSchema,
  updateAssetSchema,
  getAssetSchema,
} = require("../validators/asset.schema");
const validator = require("../middleware/validate");
const verifyAccessToken = require("../middleware/auth.middleware");
const { ROLES_LIST, verifyRoles } = require("../middleware/roles.middleware");

router
  .route("/")
  .get(
    validator.validate(getAssetSchema, "query"),
    assetController.getAllAssets,
  )
  .post(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(createAssetSchema, "body"),
    assetController.createAsset,
  );

router
  .route("/:assetId")
  .get(
    validator.validate(getAssetByIdSchema, "params"),
    assetController.getAssetById,
  )
  .patch(
    verifyAccessToken,
    verifyRoles(ROLES_LIST.ADMIN),
    validator.validate(updateAssetSchema, "body"),
    assetController.updateAsset,
  );

module.exports = router;
