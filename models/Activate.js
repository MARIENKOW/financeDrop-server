import { sequelize } from "../services/DB.js";
import Sequelize, { sql,DataTypes } from '@sequelize/core';

export const Activate = sequelize.define(
   'Activate',
   {
     // Model attributes are defined here
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement:true,
     },
     user_id: {
      type: DataTypes.INTEGER,
      allowNull:false
     },
     token: {
       type: DataTypes.STRING(100),
       allowNull:false
     },
     date_end: {
      type: DataTypes.DATE,
      defaultValue:sequelize.fn('TIMESTAMPADD',sequelize.literal('MINUTE'),30,sequelize.fn('NOW')),
      allowNull:false
     },
   },
   {
      tableName:'Activate',
      timestamps:false
   },
 );


