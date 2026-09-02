const argon2 = require("argon2");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");
const verify_jwt = require("../utils/jwt_verify");

const registerUser = async (userName, email, password) => {
  const username = userName?.trim();
  const userEmail = email?.trim().toLowerCase();

  if (!userName || !email || !password) {
    const error = new Error("Username, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await pool.query("SELECT id FROM users WHERE email=$1", [
    userEmail,
  ]);

  if (existingUser.rows.length > 0) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const pwd_hash = await argon2.hash(password);

  const result = await pool.query(
    `INSERT INTO users (username,email,password_hash) values($1,$2,$3) RETURNING id,email,username,created_at`,
    [username, userEmail, pwd_hash],
  );

  return result.rows[0];
};

const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and Password are required");
    error.statusCode = 400;
    throw error;
  }

  const userEmail = email?.trim().toLowerCase();

  const user = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    userEmail,
  ]);

  if (user.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const foundUser = user.rows[0];

  const pwd_hash = foundUser.password_hash;

  const validPassword = await argon2.verify(pwd_hash, password);

  if (!validPassword) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(foundUser);

  const refreshToken = generateRefreshToken(foundUser);

  const decodedRefreshToken = jwt.decode(refreshToken);

  const expiresAt = new Date(decodedRefreshToken.exp * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id,jti,expires_at) VALUES($1,$2,$3)`,
    [foundUser.id, decodedRefreshToken.jti, expiresAt],
  );

  return {
    id: foundUser.id,
    accessToken: accessToken,
    refreshToken: refreshToken,
    userName: foundUser.username,
    email: foundUser.email,
  };
};

const refresh = async (refreshtoken) => {
  const decoded = verify_jwt(refreshtoken);

  const { jti } = decoded;
  const { userName, email } = decoded.userInfo;

  if (!jti) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultRefreshToken = await client.query(
      "SELECT * FROM refresh_tokens WHERE jti=$1 FOR UPDATE",
      [jti],
    );

    if (resultRefreshToken.rows.length === 0) {
      const error = new Error("Refresh token not found");
      error.statusCode = 401;
      throw error;
    }

    const foundRefreshToken = resultRefreshToken.rows[0];

    if (foundRefreshToken.revoked_at !== null) {
      const error = new Error("Refresh token has already been used");
      error.statusCode = 401;
      throw error;
    }

    const foundUser = await client.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (foundUser.rows.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    const user = foundUser.rows[0];

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const decodedRefreshToken = jwt.decode(newRefreshToken);

    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    const newTokenResult = await client.query(
      `INSERT INTO refresh_tokens (user_id,jti,expires_at) VALUES($1,$2,$3) RETURNING id`,
      [user.id, decodedRefreshToken.jti, expiresAt],
    );

    const newRefreshTokenId = newTokenResult.rows[0].id;

    await client.query(
      `UPDATE refresh_tokens SET revoked_at=NOW(),replaced_by=$1 WHERE jti=$2`,
      [newRefreshTokenId, jti],
    );

    await client.query("COMMIT");

    return { newAccessToken: newAccessToken, newRefreshToken: newRefreshToken };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { registerUser, login, refresh };
