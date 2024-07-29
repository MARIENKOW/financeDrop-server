import config from "../config.js";
import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";

const { db } = config;
export const sequelize = new Sequelize({
   ...db,
   dialect: MySqlDialect,
});

(async () => {
   try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
   } catch (error) {
      console.error("Unable to connect to the database:", error);
   }
})();

(async () => {
   try {
      await sequelize.sync();
      console.log("All models were synchronized successfully");
   } catch (error) {
      console.log('db sync is not correct');
   }
})();