const { createAccount } = require("../services/account.service");

const createAccount_service = async (req, res, next) => {
  try {
    const { userId, userName } = req.body || {};

    if (!userId || !userName) {
      const error = new Error("userId and userName are required");
      error.statusCode = 400;
      return next(error);
    }

    const result = await createAccount(userId, userName);
    res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};




module.exports = { createAccount_service };
