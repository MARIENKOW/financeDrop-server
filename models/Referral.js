import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const Referral = sequelize.define(
   "Referral",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      from_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      to_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      }
   },
   {
      tableName: "referral",
      timestamps: false,
   }
);
