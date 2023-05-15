import express from "express";
import "express-async-errors";
import { body } from "express-validator";

import * as authCont from "../controller/auth.js";
import { validate } from "../middleware/validator.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

const validateLogin = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("아이디를 입력하세요.")
    .isLength({ min: 6, max: 12 })
    .withMessage("아이디는 6 ~ 12자로 입력하세요."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("비밀번호를 입력하세요.")
    .isLength({ min: 8, max: 16 })
    .withMessage("비밀번호는 8 ~ 16자로 입력하세요."),
  validate,
];

const validateSignup = [
  ...validateLogin,
  body("name") //
    .notEmpty() //
    .withMessage("이름을 입력하세요."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("이메일을 입력하세요.")
    .isEmail()
    .normalizeEmail()
    .withMessage("형식에 맞는 이메일을 입력하세요."),
  body("url")
    .isURL() //
    .withMessage("형식에 맞는 URL을 입력하세요.")
    .optional({ nullable: true, checkFalsy: true }),
  validate,
];

router.post("/signup", validateSignup, authCont.signup);
router.post("/login", validateLogin, authCont.login);
router.get("/me", isAuth, authCont.me);

export default router;
