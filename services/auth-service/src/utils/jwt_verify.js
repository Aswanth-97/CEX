const jwt = require("jsonwebtoken");
const { REFRESH_TOKEN_SECRET } = require("../config/env");
const logger = require("./logger");

const verify_jwt = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    logger.info(
      { jti: decoded.jti, userInfo: decoded.userInfo },
      "refreshtoken varified successfully",
    );
    return decoded;
  } catch (error) {

    logger.error(
      {
        err: error,
      },
      "Refresh token verification failed",
    );


    if (error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Refresh token expired";
    } else if (error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Invalid refresh token";
    }

    throw error;
  }
};

module.exports = verify_jwt;
