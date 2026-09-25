const {
  checkAccountsHealth,
  account_test1,
} = require("../services/account.service");
const logger = require("../utils/logger");

const getAccounts_Health = async (req, res, next) => {
  try {
    const response = await checkAccountsHealth(req.id);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

const account_test = async (req, res, next) => {
  try {
    const response = await account_test1(req.headers.authorization, req.id);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccounts_Health, account_test };
