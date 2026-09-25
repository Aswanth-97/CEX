const express = require("express");
const Router = express.Router();
const accounts_controllers = require("../controllers/account.controllers");
const verifyAccessToken = require("../middleware/auth.middleware");

Router.route("/health").get(accounts_controllers.getAccounts_Health);
Router.route("/test").get(verifyAccessToken, accounts_controllers.account_test);

module.exports = Router;
