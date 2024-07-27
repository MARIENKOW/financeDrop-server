import { sequelize } from "../services/DB.js";
import {  DataTypes } from "@sequelize/core";
import {NftBuy} from "./NftBuy.js"
import { User } from "./User.js";

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

// NftBuy.belongsTo(Nft, { foreignKey: "nft_id", targetKey: "id" });
// NftBuy.hasOne(Nft, { foreignKey: "id", targetKey: "nft_id" });
Nft.hasOne(NftBuy, { foreignKey: "nft_id" });
