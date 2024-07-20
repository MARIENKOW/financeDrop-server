import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const NftUp = sequelize.define(
   "NftUp",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      nft_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      checkUp_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      sum: {
         type: DataTypes.FLOAT,
         allowNull: false,
      },
   },
   {
      tableName: "nftUp",
      timestamps: false,
   }
);
