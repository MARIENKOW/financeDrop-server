import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import { NftBuy } from "./NftBuy.js";

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
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("price")).toFixed(2);
         },
         // set(value) {
         //    this.setDataValue("price", value.toFixed(2));
         // },
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

Nft.hasOne(NftBuy, { foreignKey: "nft_id" });
