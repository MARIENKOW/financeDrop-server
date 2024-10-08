import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import config from "../config.js";
import { Img } from "../models/Img.js";

class TokenService {
   generateTokens(payload) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
         expiresIn: config.ACCESS_TOKEN_MINUTES + "m",
      });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
         expiresIn: config.REFRESH_TOKEN_DAYS + "d",
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
      const data = await User.findOne({
         where: { refreshToken },
         include: Img,
      });
      if (!data) return null;
      return data;
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
      const data = await Admin.findOne({
         where: { refreshToken: refreshTokenAdmin },
      });
      if (!data) return null;
      return data.dataValues;
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
