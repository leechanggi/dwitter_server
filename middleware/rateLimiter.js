import rateLimit from "express-rate-limit";
import { config } from "../config.js";

const windowMs = config.rateLimit.windowMs;
const max = config.rateLimit.max;

export default rateLimit({
  windowMs,
  max,
});
