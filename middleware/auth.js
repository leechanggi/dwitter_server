import { config } from "../config.js";
import jwt from "jsonwebtoken";
import * as userRep from "../data/auth.js";

const jwtSecretKey = config.jwt.secretKey;
const msgAuthError = { message: "Authentication Error" };

export async function isAuth(req, res, next) {
  const authHeader = req.get("Authorization");
  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    return res.status(401).json(msgAuthError);
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token, //
    jwtSecretKey, //
    async (error, decoded) => {
      if (error) {
        return res.status(401).json(msgAuthError);
      }
      const user = await userRep.findById(decoded.id);
      if (!user) {
        return res.status(401).json(msgAuthError);
      }
      req.userId = user.id;
      req.token = user.token;
      next();
    }
  );
}
