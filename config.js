import dotenv from "dotenv";
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`key ${key} is undefined!`);
  }
  return value;
}

export const config = {
  port: parseInt(required("PORT", "8080")),
  cors: {
    origin: required("CORS_ORIGIN", "*"),
  },
  jwt: {
    secretKey: required("JWT_SECRET_KEY"),
    expireSec: parseInt(required("JWT_EXPIRE_SEC", "172800")),
  },
  bcrypt: {
    salt: parseInt(required("BCRYPT_SALT", "12")),
  },
  db: {
    host: required("DB_HOST", "localhost"),
    username: required("DB_USER", "root"),
    password: required("DB_PW"),
    port: required("DB_PORT", "3306"),
    database: required("DB_DATABASE", "dwitter"),
  },
  csrf: {
    secretKey: required("CSRF_SECRET_KEY"),
  },
  rateLimit: {
    windowMs: required("RL_WINDOWMS"),
    max: required("RL_MAX"),
  },
};
