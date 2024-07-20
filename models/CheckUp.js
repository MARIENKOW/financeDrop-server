import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";

export const CheckUp = sequelize.define(
   "CheckUp",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      date: {
         type: DataTypes.DATEONLY,
         allowNull: false,
      },
   },
   {
      tableName: "checkUp",
      timestamps: false,
   }
);


