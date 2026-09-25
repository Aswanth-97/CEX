const getPublicJWK = require("../config/keys");
const authService = require("../services/auth.service");
const pool = require("../config/db");

const authHealthCheck = async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      service: "auth-service",
      status: "ok",
      database: "ok",
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body || {};
    const user = await authService.registerUser(userName, email, password);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "login successfull",
      result,
    });
  } catch (error) {
    next(error);
  }
};

const tokenRefresh = async (req, res, next) => {
  try {
    const { refreshtoken } = req.body;
    const result = await authService.refresh(refreshtoken);

    res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    next(error);
  }
};

const userLogout = async (req, res, next) => {
  try {
    const { refreshtoken } = req.body;
    const result = await authService.logout(refreshtoken);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const JWKSendpoint = async (req, res, next) => {
  try {
    const publicJWK = await getPublicJWK();

    res.status(200).json({ keys: [publicJWK] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authHealthCheck,
  register,
  userLogin,
  tokenRefresh,
  JWKSendpoint,
  userLogout,
};
