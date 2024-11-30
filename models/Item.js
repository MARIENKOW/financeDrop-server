import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";


export const Item = sequelize.define(
   "Item",
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
      img_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      productLine_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   },
   {
      tableName: "item",
      timestamps: false,
   }
);


