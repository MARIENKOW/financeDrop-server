import { Op } from "sequelize";
import { Item } from "../models/Item.js";
import imgService from "../services/img-service.js";
import { Img } from "../models/Img.js";
import { ProductLine } from "../models/productLine.js";

class Controller {
   create = async (req, res) => {
      try {
         const { name, productLine_id } = req.body;

         const img = req?.files?.img;

         if (!name || !img || !productLine_id)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const productLineData = await ProductLine.findOne({
            where: {
               id: productLine_id,
            },
         });
         if (!productLineData)
            return res.status(404).json("Not found product line");

         const { img_id } = await imgService.save(img);

         try {
            const { id } = await Item.create({
               name,
               img_id,
               productLine_id,
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
   getByLine = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("productLine_id is not found");

         const ItemData = await Item.findAll({
            where: {
               productLine_id: id,
            },
            include: [
               {
                  model: Img,
                  as: "img",
                  required: true,
               },
            ],
         });

         if (!ItemData) return res.status(404).json("Not found item");
         return res.status(200).json(ItemData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getById = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const itemData = await Item.findOne({
            where: {
               id,
            },
            include: [
               {
                  model: Img,
                  as: "img",
                  required: true,
               },
            ],
         });
         if (!itemData) return res.status(404).json("Not found item");
         return res.status(200).json(itemData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   delete = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const itemData = await Item.findOne({
            where: {
               id,
            },
            include: [
               {
                  model: Img,
                  as: "img",
                  required: true,
               },
            ],
         });

         if (!itemData) return res.status(404).json("item is not found");

         const { img_id, img, id: item_id } = itemData;

         await itemData.destroy({ where: { id: item_id } });

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

         const itemData = await Item.findOne({
            where: {
               id,
            },
            include: [
               {
                  model: Img,
                  as: "img",
                  required: true,
               },
            ],
         });

         if (!itemData) return res.status(404).json("item not found");

         if (img) {
            const imageData = await imgService.save(img);
            data.img_id = imageData.img_id;
         }

         try {
            const updateUserData = await Item.update(
               {
                  ...data,
               },
               { where: { id: itemData.id } }
            );
         } catch (error) {
            if (img) {
               await imgService.delete(data.img_id);
            }
            throw error;
         }
         try {
            if (img) {
               await imgService.delete(itemData.img_id);
            }
         } catch (error) {}
         return res.status(200).json(itemData.id);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
}
export default new Controller();
