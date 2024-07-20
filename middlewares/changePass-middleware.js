import token from "../services/token-service.js";
import { sequelize } from "../services/DB.js";
import { RememberPass } from "../models/RememberPass.js";
import { Op } from "sequelize";

const changePassMiddleware = async (req, res, next) => {
   try {
      const { rememberPassLink } = req.body;

      if (!rememberPassLink) return res.status(403).json("Not valid request");

      const rememberPassData = await RememberPass.findOne({
         where: { rememberPassLink },
      });

      if (!rememberPassData) return res.status(403).json("Token is not found");

      const rememberPassTimeData = await RememberPass.findOne({
         where: {
            rememberPassLink,
            dateEndChange: { [Op.gte]: sequelize.fn("NOW") },
         },
      });

      if (!rememberPassTimeData)
         return res.status(403).json("Time to change pass is gone");

      const { user_id } = rememberPassTimeData;

      req.user_id = user_id;

      next();
   } catch (e) {
      console.log(e);
      res.status(500).json("some Error in middleware");
   }
};

export default changePassMiddleware;
