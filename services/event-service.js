import { User } from "../models/User.js";
import { v4 } from "uuid";
import { Img } from "../models/Img.js";
import { unlink } from "fs";
import path from "path";

export const nftImageFolder = "/uploads/nft";

class EventService {
   filterEvent = (nftDepositEvents) => {
      let depositEventsFiltered = [];

      for (let { dataValues } of nftDepositEvents) {
         const event = depositEventsFiltered.find(
            (el) => el[0] === dataValues?.date
         );
         if (!event) {
            depositEventsFiltered.push([dataValues?.date, [dataValues]]);
            continue;
         }
         event[1].push(dataValues);
      }

      return depositEventsFiltered;
   };
}

export default new EventService();
