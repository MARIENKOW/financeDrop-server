import { sequelize } from "../services/DB.js";
import { sql,DataTypes } from '@sequelize/core';
import { Activate } from "./Activate.js";
import { RememberPass } from "./RememberPass.js";


export const User = sequelize.define(
   'User',
   {
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement:true
     },
     username: {
       type: DataTypes.STRING(30),
       allowNull:false
     },
     email: {
       type: DataTypes.STRING(50),
       allowNull:false
     },
     password: {
       type: DataTypes.STRING(100),
       allowNull:false,
     },
     name: {
       type: DataTypes.STRING(30),
       allowNull:false
     },
     refreshToken: {
       type: DataTypes.STRING(200),
       allowNull:true
     },
     isActivated: {
       type: DataTypes.TINYINT(1),
       allowNull:true,
       defaultValue:0
     },
     uuid: {
      type: DataTypes.UUID.V4,
      defaultValue: sql.uuidV4,
      allowNull:false,
     },
   },
   {
      tableName:'user',
      timestamps:false
   },
 );

 User.hasOne(Activate,{ foreignKey: 'user_id',})
 User.hasOne(RememberPass,{ foreignKey: 'user_id',})

