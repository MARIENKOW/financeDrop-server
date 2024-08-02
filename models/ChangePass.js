import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import config from "../config.js";

export const ChangePass = sequelize.define(
   "ChangePass",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      changePassLink: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      dateEndChange: {
         type: DataTypes.DATE,
         defaultValue: sequelize.fn(
            "TIMESTAMPADD",
            sequelize.literal("MINUTE"),
            config.ACTIVATE_TOKEN_MINUTES,
            sequelize.fn("NOW")
         ),
         allowNull: false,
      },
      password: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
   },
   {
      tableName: "changePass",
      timestamps: false,
   }
);
