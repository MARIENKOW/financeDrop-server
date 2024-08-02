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
   },
   {
      tableName: "site",
      timestamps: false,
   }
);
