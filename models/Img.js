import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";
import { Nft } from "./Nft.js";
import { User } from "./User.js";
import { CashOut } from "./CashOut.js";

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
         get() {
            return process.env.API_URL+this.getDataValue("path");
         },
      }
   },
   {
      tableName: "img",
      timestamps: false,
   }
);

Img.hasOne(Nft,{foreignKey:'img_id'})
Img.hasOne(User,{foreignKey:'img_id'})
Img.hasOne(CashOut,{foreignKey:'img_id'})
