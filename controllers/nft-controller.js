
import { Op } from "sequelize";
import { Nft } from "../models/Nft.js";
import imgService from "../services/img-service.js";
import { NftBuy } from "../models/NftBuy.js";
import { Img } from "../models/Img.js";

class Controller {
   create = async (req, res) => {
      try {
         const { name, percent, price, days, description, link } = req.body;

         const img = req.files.img;

         if (
            !name ||
            !percent ||
            !price ||
            !days ||
            !description ||
            !link ||
            !img
         )
            return res.status(400).json({ "root.server": "Incorrect values" });
         const { img_id } = await imgService.save(img);

         try {
            const { id } = await Nft.create({
               name,
               percent,
               price,
               days,
               description,
               link,
               img_id,
            });
            return res.status(200).json(id);
         } catch (error) {
            await imgService.delete(img_id);
            throw error;
         }
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getNotSold = async (req, res) => {
      try {
         const nftData = await Nft.findAll({
            where:{
               '$nftBuy.id$':{
                  [Op.is]:null
               }
            },
            include: [
               {
                  model: NftBuy,
                  as: "nftBuy",
                  required: false,
               },
               {
                  model: Img,
                  as: "img",
                  required: true,
               }
            ],
         });
         console.log(nftData);
         return res.status(200).json(nftData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
}
export default new Controller();
