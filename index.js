import express from "express";
import cors from "cors";
import UserRouter from "./routers/UserRouter.js";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import AdminRouter from "./routers/AdminRouter.js";
import NftRouter from "./routers/NftRouter.js";
import fileUpload from "express-fileupload";
import { CheckUp } from "./models/CheckUp.js";
import { Op } from "sequelize";
import { NftBuy } from "./models/NftBuy.js";
import { sequelize } from "./services/DB.js";
import { Nft } from "./models/Nft.js";
import config from "./config.js";
import { User } from "./models/User.js";
import { Event } from "./models/Event.js";
import { Referral } from "./models/Referral.js";
import { Site } from "./models/Site.js";
import SiteRouter from "./routers/SiteRouter.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
   })
);

app.use(process.env.NFT_FOLDER, express.static("./" + process.env.NFT_FOLDER));
app.use("/User", UserRouter);
app.use("/", SiteRouter);
app.use("/Admin", AdminRouter);
app.use("/Nft", NftRouter);

const web = http.Server(app);

try {
   web.listen(PORT, process.env.SERVER_URL, () =>
      console.log("Server is working")
   );
} catch (e) {
   console.log(`${e.message}`);
}

const setIntervalFunction = async () => {
   try {
      const checkUpDate = await CheckUp.findOne({
         where: { date: { [Op.gte]: sequelize.fn("CURDATE") } },
         order: [["date", "desc"]],
      });

      if (checkUpDate) throw new Error("not correct date");

      const newCheckUp = await CheckUp.create();

      const { id: checkUp_id } = newCheckUp;

      const nftData = await Nft.findAll({
         include: [
            {
               model: NftBuy,
               as: "nftBuy",
               required: true,
               where: { active: 1 },
            },
         ],
      });

      if (!nftData) throw new Error("not found NftBuy");

      try {
         for (let nft of nftData) {
            const sum = nft.price * (nft.percent / 100);
            await Event.create({
               name: nft?.name,
               deposit_type: 1,
               user_id: nft?.nftBuy?.user_id,
               sum,
               checkUp_id,
            });

            const { nftDeposit, id, username } = await nft?.nftBuy.getUser();

            const referralData = await Referral.findOne({
               where: { to_id: id },
            });

            if (referralData) {
               const { from_id } = referralData;

               const fromUserData = await User.findOne({
                  where: { id: from_id },
               });

               if (fromUserData) {
                  const { referralPercent } = Site.findOne();

                  const referralSum = sum * (referralPercent / 100);
                  await Event.create({
                     name: "@" + username,
                     deposit_type: 2,
                     user_id: fromUserData?.id,
                     sum: referralSum,
                     checkUp_id,
                  });
                  await User.update(
                     {
                        referralDeposit: (
                           parseFloat(fromUserData?.referralDeposit) +
                           referralSum
                        ).toFixed(2),
                     },
                     { where: { id: fromUserData?.id } }
                  );
               }
            }

            await User.update(
               { nftDeposit: (parseFloat(nftDeposit) + sum).toFixed(2) },
               { where: { id } }
            );
         }
      } catch (error) {
         newCheckUp.destroy();
         throw error;
      }

      await NftBuy.update(
         {
            active: 0,
         },
         {
            where: { date_end: { [Op.lte]: sequelize.fn("CURDATE") } },
         }
      );
   } catch (error) {
      console.log(error);
   }
};

setIntervalFunction();

setInterval(setIntervalFunction, config.INTERVAL_FN_HOUR * 3600000);
