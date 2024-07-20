import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";

export const Img = sequelize.define(
   "Img",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue:null
      },
      path: {
         type: DataTypes.STRING,
         allowNull: false,
      }
   },
   {
      tableName: "img",
      timestamps: false,
   }
);


