const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { createRemoteJWKSet, jwtVerify } = require("jose");
const { AUTH_SERVICE_URL } = require("../config/env");
const { log } = require("console");

const JWKS = createRemoteJWKSet(
  new URL(`${AUTH_SERVICE_URL}/api/auth/.well-known/jwks.json`),
);

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Accesstoken required");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });
    req.user = payload.userInfo;
    next();
  } catch (error) {
    error.statusCode = 401;       
    next(error);
  }
};

module.exports = verifyAccessToken;
