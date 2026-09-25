const express = require("express");
const Router = express.Router();
const accountControllers = require("../controllers/account.controllers");
const verifyAccessToken = require("../middleware/auth.middleware");
const varifyInternalService = require("../middleware/varifyInternalService");

Router.route("/").post(
  varifyInternalService,
  accountControllers.createAccount_service,
);

module.exports = Router;
