import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import { Event } from "./Event.js";

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
         defaultValue: sequelize.fn("CURDATE"),
      },
   },
   {
      tableName: "checkUp",
      timestamps: false,
   }
);

CheckUp.hasOne(Event, { foreignKey: "checkUp_id" });
