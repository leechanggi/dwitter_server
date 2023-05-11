import { config } from '../config.js';
import SQ from 'sequelize';

const { host, username, password, port, database } = config.db;
export const sequelize = new SQ.Sequelize(database, username, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false,
});
