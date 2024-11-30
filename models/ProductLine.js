import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import { Item } from "./Item.js";

export const ProductLine = sequelize.define(
   "ProductLine",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      }
   },
   {
      tableName: "productLine",
      timestamps: false,
   }
);

ProductLine.hasMany(Item, { foreignKey: "productLine_id" });


