import Joi from "joi";

const email = Joi.string().email();

export const validateEmail = Joi.object({
  email: email.required(),
});
