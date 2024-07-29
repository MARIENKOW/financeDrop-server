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
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("sum")).toFixed(2);
         },
         // set(value) {
         //    this.setDataValue("sum", value.toFixed(2));
         // },
      },
   },
   {
      tableName: "nftUp",
      timestamps: false,
   }
);
