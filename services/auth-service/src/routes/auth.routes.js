const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth.controllers");

router.route("/health").get(authControllers.authHealthCheck);

router.route("/register").post(authControllers.register);

router.route("/login").post(authControllers.userLogin);

router.route("/refresh").post(authControllers.tokenRefresh);

router.route("/logout").post(authControllers.userLogout);

router.route("/.well-known/jwks.json").get(authControllers.JWKSendpoint);

module.exports = router;
