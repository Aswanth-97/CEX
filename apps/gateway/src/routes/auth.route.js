const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth.controllers");
const verifyAccessToken = require("../middleware/auth.middleware");

router.route("/health").get(authControllers.getAuthHealth);
router.route("/register").post(authControllers.registration);
router.route("/login").post(authControllers.userLogin);
router.route("/refresh").post(authControllers.tokenRefresh);
router.route("/me").get(verifyAccessToken,authControllers.me);

module.exports = router;
