import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log({ message: errors.array()[0].msg });
  return res.status(400).json({ message: errors.array()[0].msg });
};
