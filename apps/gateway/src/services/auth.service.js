const axios = require("axios");
const { AUTH_SERVICE_URL } = require("../config/env");

const checkAuthHealth = async () => {
  const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/health`);
  return response;
};

const registerUser = async (userName, email, password) => {
  const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
    userName,
    email,
    password,
  });
  return response;
};

const login = async (email, password) => {
  const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
    email,
    password,
  });
  return response;
};

const refresh = async (refreshtoken) => {
  const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
    refreshtoken,
  });
  return response;
};

module.exports = { checkAuthHealth, registerUser, login, refresh };
