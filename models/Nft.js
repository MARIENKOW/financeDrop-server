import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";

export const Nft = sequelize.define(
   "Nft",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      price: {
         type: DataTypes.FLOAT,
         allowNull: false,
      },
      days: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      percent: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      img_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      link: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   },
   {
      tableName: "nft",
      timestamps: false,
   }
);


