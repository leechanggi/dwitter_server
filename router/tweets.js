import express from "express";
import "express-async-errors";
import { body } from "express-validator";

import * as tweetCont from "../controller/tweet.js";
import { validate } from "../middleware/validator.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

const validateTweetText = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("내용을 입력해 주세요.")
    .isLength({ min: 3, max: 30 })
    .withMessage("내용은 3 ~ 30자 이내로 입력할 수 있습니다."),
  validate,
];

// router.get('/', isAuth, tweetCont.getTweets);
router.post("/", isAuth, validateTweetText, tweetCont.createTweets);
router.get("/:id", isAuth, tweetCont.getTweet);
router.put("/:id", isAuth, validateTweetText, tweetCont.updateTweet);
router.delete("/:id", isAuth, tweetCont.deleteTweet);

export default router;
