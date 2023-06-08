import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import "express-async-errors";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config.js";
import { initSocket } from "./connection/socket.js";
import { sequelize } from "./db/database.js";
import { csrfCheck } from "./middleware/csrf.js";
import rateLimiter from "./middleware/rateLimiter.js";

import tweetsRouter from "./router/tweets.js";
import authRouter from "./router/auth.js";
import { NextFunction } from "express";

const app: Express = express();
const ports = config.port;
const CORS_ORIGIN = config.cors.origin;

const options = {
  dotfiles: "ignore",
  etag: false,
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders: function (res: express.Response<any, Record<string, any>>, path: string, stat: any) {
    res.set("x-timestamp", Date.now().toString());
  },
};

const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public", options));

app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("tiny"));

app.use(rateLimiter);
app.use(csrfCheck);

app.use("/auth", authRouter);
app.use("/tweets", tweetsRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.sendStatus(404);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
  });
});

sequelize.sync().then(() => {
  const server = app.listen(ports);
  initSocket(server);
  console.log(
    `SERVER_START : { 'STATE' : 'is-Active', 'PORT': '${ports}', 'DATE' : '${new Date()}' }`
  );
});
