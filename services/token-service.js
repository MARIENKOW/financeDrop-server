import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";

class TokenService {
   generateTokens(payload) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
         expiresIn: "30m",
      });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
         expiresIn: "30d",
      });
      return {
         accessToken,
         refreshToken,
      };
   }
   async saveTokenUser(userId, refreshToken) {
      return await User.update({ refreshToken }, { where: { id: userId } });
   }
   async removeTokenUser(refreshToken) {
      return await User.update(
         { refreshToken: null },
         { where: { refreshToken } }
      );
   }
   async findTokenUser(refreshToken) {
      const { dataValues } = await User.findOne({ where: { refreshToken } });
      return dataValues;
   }
   async saveTokenAdmin(adminId, refreshTokenAdmin) {
      return await Admin.update(
         { refreshToken: refreshTokenAdmin },
         { where: { id: adminId } }
      );
   }
   async removeTokenAdmin(refreshTokenAdmin) {
      return await Admin.update(
         { refreshToken: null },
         { where: { refreshToken: refreshTokenAdmin } }
      );
   }
   async findTokenAdmin(refreshTokenAdmin) {
      const { dataValues } = await Admin.findOne({
         where: { refreshToken: refreshTokenAdmin },
      });
      return dataValues;
   }
   validateAccessToken(token) {
      try {
         const data = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
         return data;
      } catch (e) {
         return null;
      }
   }
   validateRefreshToken(token) {
      try {
         const data = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
         return data;
      } catch (e) {
         return null;
      }
   }
}

export default new TokenService();
