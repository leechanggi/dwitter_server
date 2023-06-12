import jwt from "jsonwebtoken";
import { config } from "../config.js";
import * as userRep from "../data/auth";

const JWT_SECRET_KEY = config.jwt.secretKey;
const AUTH_ERROR = { message: "Authentication Error" };

export async function isAuth(req, res, next) {
  let token;
  const authHeader = req.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    token = req.cookies["token"];
  }

  if (!token) {
    return res.status(401).json(AUTH_ERROR);
  }

  jwt.verify(token, JWT_SECRET_KEY, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }
    const user = await userRep.findById(decoded.id);
    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }
    req.userId = user.id;
    req.token = user.token;
    next();
  });
}

export async function authHandler(req) {
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userRep.findById(decoded.id);
    if (!user) {
      throw { status: 401, ...AUTH_ERROR };
    }
    req.userId = user.id;
    req.token = decoded;
    return true;
  } catch (err) {
    console.log(err);
    throw { status: 401, ...AUTH_ERROR };
  }
}
