const {
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXP,
  ACCES_TOKEN_EXP,
} = require("../config/env");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const privateKey = fs.readFileSync(
  path.join(__dirname, "../../keys/access-token-private.pem"),
  "utf8",
);

const generateAccessToken = (user) => {
  const accestoken = jwt.sign(
    {
      userInfo: { userName: user.username, email: user.email },
    },
    privateKey,
    {
      expiresIn: ACCES_TOKEN_EXP,
      algorithm: "RS256",
      keyid: "access-token-key-1",
    },
  );
  return accestoken;
};

const generateRefreshToken = (user) => {
  const jti = randomUUID();

  const refreshtoken = jwt.sign(
    {
      userInfo: { userName: user.username, email: user.email },
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXP, jwtid: jti },
  );

  return refreshtoken;
};

module.exports = { generateAccessToken, generateRefreshToken };
