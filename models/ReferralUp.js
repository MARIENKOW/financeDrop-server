import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const ReferralUp = sequelize.define(
   "ReferralUp",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      nftUp_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      referral_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      sum: {
         type: DataTypes.FLOAT,
         allowNull: false,
      },
   },
   {
      tableName: "referralUp",
      timestamps: false,
   }
);
