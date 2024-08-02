import { User } from "../models/User.js";
import { Img } from "../models/Img.js";
import { NftBuy } from "../models/NftBuy.js";
import { Nft } from "../models/Nft.js";
import { CheckUp } from "../models/CheckUp.js";
import { Event } from "../models/Event.js";
import { sequelize } from "./DB.js";
import eventService from "./event-service.js";

export const nftImageFolder = "/uploads/nft";

class UserService {
   fullInfo = async (userData) => {
      try {

         const t = userData.dataValues

         const nft = await NftBuy.findAll({
            where: { user_id: t.id },
            order: [["date_end", "asc"]],
            attributes: { exclude: ["user_i", "nft_id"] },
            include: {
               model: Nft,
               required: true,
               include: {
                  model: Img,
                  required: true,
               },
            },
         });
         t.nft = nft;
         t.totalDeposit = userData.totalDeposit;

         const nftDepositEvents = await Event.findAll({
            where: { user_id: t.id, deposit_type: 1 },
            order: [
               ["date", "desc"],
               ["id", "desc"],
            ],
            include: {
               model: CheckUp,
               attributes: [],
               required: true,
               as: "checkUp",
            },
            attributes: [
               "sum",
               [sequelize.col("checkUp.date"), "date"],
               "name",
               "increment",
            ],
         });

         t.nftDepositEvents = eventService.filterEvent(nftDepositEvents);

         const referralDepositEvents = await Event.findAll({
            where: { user_id: t.id, deposit_type: 2 },
            order: [
               ["date", "desc"],
               ["id", "desc"],
            ],
            include: {
               model: CheckUp,
               attributes: [],
               required: true,
               as: "checkUp",
            },
            attributes: [
               "sum",
               [sequelize.col("checkUp.date"), "date"],
               "name",
               "increment",
               "id",
            ],
         });

         t.referralDepositEvents = eventService.filterEvent(referralDepositEvents);

         const otherDepositEvents = await Event.findAll({
            where: { user_id: t.id, deposit_type: 3 },
            order: [
               ["date", "desc"],
               ["id", "desc"],
            ],
            include: {
               model: CheckUp,
               attributes: [],
               required: true,
               as: "checkUp",
            },
            attributes: [
               "sum",
               [sequelize.col("checkUp.date"), "date"],
               "name",
               "increment",
               "id",
            ],
         });

         t.otherDepositEvents = eventService.filterEvent(otherDepositEvents);
         return t;
      } catch (error) {
         throw error;
      }
   };
}

export default new UserService();
