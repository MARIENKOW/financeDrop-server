import jwt from 'jsonwebtoken';
import DB from './DB.js';

class TokenService {
   generateTokens(payload) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
      return {
         accessToken,
         refreshToken
      }
   }
   async saveTokenUser(userId, refreshToken) {
      const [rezult] = await DB.query(`SELECT refreshToken from user where id = '${userId}'`);
      return await DB.query(`UPDATE user SET refreshToken = '${refreshToken}' WHERE id = '${userId}';`)
   }
   async removeTokenUser(refreshToken) {
      const token = await DB.query(`UPDATE user SET refreshToken = null where user.refreshToken = '${refreshToken}'`)
      return token;
   }
   async findTokenUser(refreshToken) {
      const [token] = await DB.query(`SELECT * FROM user where user.refreshToken = '${refreshToken}'`)
      return token[0];
   }
   async saveTokenAdmin(adminId, refreshTokenAdmin) {
      const [rezult] = await DB.query(`SELECT refreshToken from admin where id = '${adminId}'`);
      return await DB.query(`UPDATE admin SET refreshToken = '${refreshTokenAdmin}' WHERE id = '${adminId}';`)
   }
   async removeTokenAdmin(refreshTokenAdmin) {
      const token = await DB.query(`UPDATE admin SET refreshToken = null where admin.refreshToken = '${refreshTokenAdmin}'`)
      return token;
   }
   async findTokenAdmin(refreshTokenAdmin) {
      const [token] = await DB.query(`SELECT * FROM admin where admin.refreshToken = '${refreshTokenAdmin}'`)
      return token[0];
   }
   validateAccessToken(token) {
      try {
         const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
         return userData;
      } catch (e) {
         return null;
      }
   }
   validateRefreshToken(token) {
      try {
         const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
         return userData;
      } catch (e) {
         return null;
      }
   }
}

export default new TokenService();