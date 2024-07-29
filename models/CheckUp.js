import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";
import { NftBuy } from "./NftBuy.js";
import { NftUp } from "./NftUp.js";

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
         defaultValue:sequelize.fn("CURDATE")
      },
   },
   {
      tableName: "checkUp",
      timestamps: false,
   }
);

CheckUp.hasOne(NftUp,{foreignKey:'checkUp_id'})


