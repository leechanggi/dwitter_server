import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import * as OpenApiValidator from "express-openapi-validator";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUI from "swagger-ui-express";
import yaml from "yamljs";

import { config } from "./config.js";
import { initSocket } from "./connection/socket.js";
import { sequelize } from "./db/database.js";
import { authHandler } from "./middleware/auth.js";
import { csrfCheck } from "./middleware/csrf.js";
import rateLimiter from "./middleware/rateLimiter.js";
import * as apis from "./controller/index.js";

import tweetsRouter from "./router/tweets.js";
import authRouter from "./router/auth.js";

const openApiDoc = yaml.load("./api/openapi.yaml");
const app = express();

// DEP
const ports = config.port;
const CORS_ORIGIN = config.cors.origin;

const options = {
  dotfiles: "ignore",
  etag: false,
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};

const corsOptions = {
  origin: [CORS_ORIGIN],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true, // Access-Control-Allow-Credentials
};

function modulePathResolver(_, route, apiDoc) {
  const pathKey = route.openApiRoute.substring(route.basePath.length);
  const operation = apiDoc.paths[pathKey][route.method.toLowerCase()];
  const methodName = operation.operationId;
  return apis[methodName];
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public", options));

app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("tiny"));

app.use(rateLimiter);
app.use(csrfCheck);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openApiDoc));
app.use("/auth", authRouter);
app.use("/tweets", tweetsRouter);
app.use(
  OpenApiValidator.middleware({
    apiSpec: "./api/openapi.yaml",
    validateResponses: true,
    operationHandlers: {
      resolver: modulePathResolver,
    },
    validateSecurity: {
      handlers: {
        jwt_auth: authHandler,
      },
    },
  })
);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
  });
});

sequelize.sync().then((value) => {
  const server = app.listen(ports);
  initSocket(server);
  console.log(
    `SERVER_START : { 'STATE' : 'is-Active', 'PORT': '${ports}', 'DATE' : '${new Date()}' }`
  );
});
