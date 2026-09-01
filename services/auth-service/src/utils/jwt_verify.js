const jwt = require("jsonwebtoken");
const { REFRESH_TOKEN_SECRET } = require("../config/env");

const verify_jwt = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (error) {
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
