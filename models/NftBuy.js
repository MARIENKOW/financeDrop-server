import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import { User } from "./User.js";

export const NftBuy = sequelize.define(
   "NftBuy",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      nft_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      active: {
         type: DataTypes.TINYINT(1),
         allowNull: false,
         defaultValue: 1,
      },
      date_end: {
         type: DataTypes.DATEONLY,
         allowNull: false,
      },
   },
   {
      tableName: "nftBuy",
      timestamps: false,
   }
);

// NftBuy.belongsTo(User,{foreignKey:'user_id'})
