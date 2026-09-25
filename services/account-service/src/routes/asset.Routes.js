const express = require("express");
const router = express.Router();
const assetController = require("../controllers/asset.controllers");

router.get("/", assetController.getAllAssets);


module.exports = router;
