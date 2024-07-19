import { sequelize } from "../services/DB.js";
import { DataTypes } from '@sequelize/core';
import moment from "moment";


export const RememberPass = sequelize.define(
   'RememberPass',
   {
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement:true
     },
     rememberPassLink: {
       type: DataTypes.STRING(100),
       allowNull:false
     },
     user_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
     },
     dateEndChange: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('TIMESTAMPADD',sequelize.literal('MINUTE'),30,sequelize.fn('NOW')),
      allowNull:false
     },
   },
   {
      tableName:'rememberPass',
      timestamps:false
   },
 );