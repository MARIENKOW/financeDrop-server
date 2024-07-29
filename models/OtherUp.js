import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const OtherUp = sequelize.define(
   "OtherUp",
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
      sum: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("sum")).toFixed(2);
         },
      },
      description: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      date: {
         type: DataTypes.DATEONLY,
         allowNull: false,
         defaultValue: sequelize.fn("CURDATE"),
      },
   },
   {
      tableName: "otherUp",
      timestamps: false,
   }
);
