import express from "express";
import cors from "cors";
import UserRouter from "./routers/UserRouter.js";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import AdminRouter from "./routers/AdminRouter.js";
import NftRouter from "./routers/NftRouter.js";
import fileUpload from "express-fileupload";
// import {} from './ModelsCommunication.js'
import { CheckUp } from "./models/CheckUp.js";
import { Op } from "sequelize";
import { NftBuy } from "./models/NftBuy.js";
import { NftUp } from "./models/NftUp.js";
import { sequelize } from "./services/DB.js";
import { Nft } from "./models/Nft.js";
import config from "./config.js";
import OtherUpRouter from "./routers/OtherUpRouter.js";

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
app.use("/Admin", AdminRouter);
app.use("/Nft", NftRouter);
app.use("/OtherUp", OtherUpRouter);

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

      const { id: checkUpId } = newCheckUp;

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
            await NftUp.create({
               checkUp_id: checkUpId,
               sum: nft.price * (nft.percent / 100),
               nft_id: nft.id,
            });
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

setInterval(setIntervalFunction, config.INTERVAL_FN_HOUR*3600000);
