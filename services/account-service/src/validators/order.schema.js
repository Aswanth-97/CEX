const Joi = require("joi");

const createOrderSchema = Joi.object({
  marketId: Joi.string().uuid().required(),

  clientOrderId: Joi.string().trim().min(1).max(40).optional(),

  side: Joi.string().valid("BUY", "SELL").required(),

  orderType: Joi.string().valid("LIMIT").default("LIMIT"),

  price: Joi.string()
    .pattern(/^\d+(\.\d+)?$/)
    .required(),

  quantity: Joi.string()
    .pattern(/^\d+(\.\d+)?$/)
    .required(),
});

const getOrderByIdSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

const getOrdersByAccountIdSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
});

module.exports = {
  createOrderSchema,
  getOrderByIdSchema,
  getOrdersByAccountIdSchema,
};
