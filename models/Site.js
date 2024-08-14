import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const Site = sequelize.define(
   "Site",
   {
      referralPercent: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey:true
      },
      cashOutPercent: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      wallet: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   },
   {
      tableName: "site",
      timestamps: false,
   }
);
