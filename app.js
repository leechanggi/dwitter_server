import { config } from './config.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import 'express-async-errors';

import tweetsRouter from './router/tweets.js';
import authRouter from './router/auth.js';

import { initSocket } from './connection/socket.js';
import { sequelize } from './db/database.js';
import { csrfCheck } from './middleware/csrf.js';

const app = express();

// DEP
const ports = config.port;
const CORS_ORIGIN = config.cors.origin;

const options = {
  dotfiles: 'ignore',
  etag: false,
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  },
};

const corsOptions = {
  origin: [CORS_ORIGIN],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  optionsSuccessStatus: 200,
  credentials: true, // Access-Control-Allow-Credentials
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', options));

app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('tiny'));

app.use(csrfCheck);
app.use('/auth', authRouter);
app.use('/tweets', tweetsRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

sequelize.sync().then(value => {
  const server = app.listen(ports);
  initSocket(server);
  console.log(
    `SERVER_START : { 'STATE' : 'is-Active', 'PORT': '${ports}', 'DATE' : '${new Date()}' }`
  );
});
