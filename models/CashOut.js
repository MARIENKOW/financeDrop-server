import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const CashOut = sequelize.define(
   "CashOut",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      adminMessage: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      addressMatic: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      type: {
         type: DataTypes.TINYINT(1),
         allowNull: false,
         defaultValue: 1,
      },
      user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      deposit_type: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      sum: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("sum")).toFixed(2);
         },
      },
      img_id: {
         type: DataTypes.INTEGER,
         allowNull: true,
      },
      date: {
         type: DataTypes.DATEONLY,
         allowNull: true,
         defaultValue: sequelize.fn("CURDATE"),
      },
   },
   {
      tableName: "cash_out",
      timestamps: false,
   }
);

export const cashOutTypes = {
   1: "pending",
   2: "confirm",
   3: "reject",
};
