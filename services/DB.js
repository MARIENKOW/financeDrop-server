import mysql from "mysql2/promise";
import config from "../config.js";
import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
const { db } = config;
export const sequelize = new Sequelize({
   ...db,
   dialect: MySqlDialect,
});
