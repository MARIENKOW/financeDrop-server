import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const Admin = sequelize.define(
   "Admin",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      password: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING(30),
         allowNull: false,
      },
      refreshToken: {
         type: DataTypes.STRING,
         allowNull: true,
      },
   },
   {
      tableName: "admin",
      timestamps: false,
   }
);
