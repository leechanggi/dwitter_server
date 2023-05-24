import { config } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'express-async-errors';

import * as userRep from '../data/auth.js';

const JWT_SECRET_KEY = config.jwt.secretKey;
const JWT_EXPIRE_SEC = config.jwt.expireSec;
const BCRYPT_SALT = config.bcrypt.salt;
const CSRF_SECRET_KEY = config.csrf.secretKey;

export async function signup(req, res) {
  const { username, password, name, email, url } = req.body;
  const foundUsername = await userRep.findByUsername(username);
  if (foundUsername) {
    return res.status(409).json({ message: '사용할 수 없는 아이디 입니다.' });
  }
  const hashed = bcrypt.hashSync(password, BCRYPT_SALT);
  const userId = await userRep.create({
    username,
    password: hashed,
    name,
    email,
    url,
  });
  const token = createJwtToken(userId);
  setToken(res, token);
  res.status(201).json({ token, username });
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await userRep.findByUsername(username);
  if (!user) {
    return res.status(401).json({ message: '아이디 혹은 비밀번호가 잘못되었습니다.' });
  }
  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: '아이디 혹은 비밀번호가 잘못되었습니다.' });
  }
  const token = createJwtToken(user.id);
  setToken(res, token);
  res.status(200).json({ token, username });
}

export async function logout(req, res, next) {
  res.cookie('token', '');
  res.status(200).json({ message: '로그아웃이 완료되었습니다.' });
}

export async function me(req, res) {
  const user = await userRep.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
  res.status(200).json({ token: req.token, username: user.username });
}

export async function csrfToken(req, res, next) {
  const csrfToken = await generateCsrfToken();
  return res.status(200).json({ csrfToken });
}

function createJwtToken(id) {
  return jwt.sign({ id }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRE_SEC });
}

function setToken(res, token) {
  const options = {
    maxAge: config.jwt.expireSec * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('token', token, options);
}

async function generateCsrfToken() {
  return bcrypt.hash(CSRF_SECRET_KEY, 1);
}
