import * as SQ from "sequelize";
import { sequelize } from "../db/database.js";
import { User } from "./auth";

const DataTypes = SQ.DataTypes;
const Sequelize = SQ.Sequelize;

const Tweet = sequelize.define("tweet", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Tweet.belongsTo(User);

const INCLUDE_USER: SQ.FindOptions = {
  attributes: [
    "id",
    "text",
    "createdAt",
    "userId",
    [Sequelize.col("user.name"), "name"],
    [Sequelize.col("user.username"), "username"],
    [Sequelize.col("user.url"), "url"],
  ],
  include: { model: User, attributes: [] },
};

const ORDER_DESC: SQ.FindOptions = {
  order: [["createdAt", "DESC"]],
};

export async function getAll() {
  return Tweet.findAll({ ...INCLUDE_USER, ...ORDER_DESC, raw: true });
}

export async function getAllByUsername(username: string) {
  return Tweet.findAll({
    ...INCLUDE_USER,
    ...ORDER_DESC,
    include: { model: User, attributes: [], where: { username } },
    raw: true,
  });
}

export async function getById(id: string) {
  return Tweet.findOne({
    where: { id },
    ...INCLUDE_USER,
  });
}

export async function create(text: string, userId: string) {
  return Tweet.create({ text, userId }).then((data) => getById(data.dataValues.id));
}

export async function update(id: string, text: string) {
  return Tweet.findByPk(id, INCLUDE_USER) //
    .then((tweet: any) => {
      tweet.text = text;
      return tweet.save();
    });
}

export async function remove(id: string): Promise<void> {
  return Tweet.findByPk(id).then((tweet: any) => tweet.destroy());
}
