import { Op } from "sequelize";
import { Nft } from "../models/Nft.js";
import imgService from "../services/img-service.js";
import { NftBuy } from "../models/NftBuy.js";
import { Img } from "../models/Img.js";
import { sequelize } from "../services/DB.js";

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
            where: {
               "$nftBuy.id$": {
                  [Op.is]: null,
               },
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
               },
            ],
         });
         return res.status(200).json(nftData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getById = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const nftData = await Nft.findOne({
            where: {
               "$nftBuy.id$": {
                  [Op.is]: null,
               },
               id,
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
               },
            ],
         });
         if (!nftData) return res.status(404).json("Not found NFT");
         return res.status(200).json(nftData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   delete = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const nftData = await Nft.findOne({
            where: {
               "$nftBuy.id$": {
                  [Op.is]: null,
               },
               id,
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
               },
            ],
         });

         if (!nftData) return res.status(404).json("NFT is not found");

         const { img_id, img, id: nft_id } = nftData;

         await Nft.destroy({ where: { id: nft_id } });

         try {
            await imgService.delete(img_id); //!   maybe delete
         } catch (error) {
            console.log(error);
         }

         return res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   update = async (req, res) => {
      try {
         const data = req.body;

         const { id } = req.params;

         const img = req?.files?.img;

         if (!data || !id)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const nftData = await Nft.findOne({
            where: {
               "$nftBuy.id$": {
                  [Op.is]: null,
               },
               id,
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
               },
            ],
         });

         if (!nftData) return res.status(404).json("NFT is not found");

         if (img) {
            const imageData = await imgService.save(img);
            data.img_id = imageData.img_id;
         }

         try {
            const updateUserData = await Nft.update(
               {
                  ...data,
               },
               { where: { id: nftData.id } }
            );
         } catch (error) {
            if (img) {
               await imgService.delete(data.img_id);
            }
            throw error;
         }
         try {
            if (img) {
               await imgService.delete(nftData.img_id);
            }
         } catch (error) {}
         return res.status(200).json(nftData.id);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   sendNft = async (req, res) => {
      try {
         const { nft } = req.body;
         const { id } = req.params;

         if (!nft || !id || nft.length === 0)
            return res.status(400).json("NFT is not found");

         const nftBuyArr = [];

         for (let nftId of nft) {
            const nftData = await Nft.findOne({
               where: {
                  id: nftId,
                  "$nftBuy.id$": {
                     [Op.is]: null,
                  },
               },
               include: { model: NftBuy, as: "nftBuy", required: false },
            });

            if (!nftData) res.status(404).json("NFT is not found");

            nftBuyArr.push(
               NftBuy.build({
                  user_id: id,
                  nft_id: nftData.id,
                  date_end: sequelize.fn(
                     "DATE_ADD",
                     sequelize.fn("NOW"),
                     sequelize.literal(`INTERVAL ${nftData.days} DAY`)
                  ),
               })
            );
         }

         for (let nftBuy of nftBuyArr) {
            await nftBuy.save();
         }

         return res.json(true);
      } catch (e) {
         res.status(500).json(e.message);
         console.log(e);
      }
   };
}
export default new Controller();
