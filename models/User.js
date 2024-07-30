import { sequelize } from "../services/DB.js";
import { sql, DataTypes } from "@sequelize/core";
import { Activate } from "./Activate.js";
import { RememberPass } from "./RememberPass.js";
import { NftBuy } from "./NftBuy.js";
import { Event } from "./Event.js";

export const User = sequelize.define(
   "User",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      username: {
         type: DataTypes.STRING(30),
         allowNull: false,
      },
      email: {
         type: DataTypes.STRING(50),
         allowNull: false,
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
      isActivated: {
         type: DataTypes.TINYINT(1),
         allowNull: true,
         defaultValue: 0,
      },
      uuid: {
         type: DataTypes.UUID.V4,
         defaultValue: sql.uuidV4,
         allowNull: false,
      },
      nftDeposit: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("nftDeposit")).toFixed(2);
         },
      },
      referralDeposit: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("referralDeposit")).toFixed(2);
         },
      },
      otherDeposit: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         get() {
            return parseFloat(this.getDataValue("otherDeposit")).toFixed(2);
         },
      },
      totalDeposit: {
         type: DataTypes.VIRTUAL,
         get() {
            return (
               parseFloat(this.otherDeposit) +
               parseFloat(this.referralDeposit) +
               parseFloat(this.nftDeposit)
            ).toFixed(2);
         },
      },
   },
   {
      tableName: "user",
      timestamps: false,
   }
);

User.hasOne(Activate, { foreignKey: "user_id" });

User.hasOne(RememberPass, { foreignKey: "user_id" });

User.hasMany(NftBuy, { foreignKey: "user_id" });

User.hasMany(Event, { foreignKey: "user_id" });
