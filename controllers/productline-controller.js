import { Item } from "../models/Item.js";
import { Img } from "../models/Img.js";
import { ProductLine } from "../models/productLine.js";

class Controller {
   create = async (req, res) => {
      try {
         const { name } = req.body;

         if (!name)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const { id } = await ProductLine.create({
            name,
         });

         return res.status(200).json(id);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getAll = async (req, res) => {
      try {
         const productLineData = await ProductLine.findAll({
            include: [
               {
                  model: Item,
                  as: "items",
                  include: [
                     {
                        model: Img,
                        as: "img",
                        required: true,
                     },
                  ],
               },
            ],
         });
         if (!productLineData)
            return res.status(404).json("Not found product line");
         return res.status(200).json(productLineData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getById = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const productLineData = await ProductLine.findOne({
            where: {
               id,
            },
            include: [
               {
                  model: Item,
                  as: "items",
                  include: [
                     {
                        model: Img,
                        as: "img",
                     },
                  ],
               },
            ],
         });
         if (!productLineData)
            return res.status(404).json("Not found product line");
         return res.status(200).json(productLineData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   delete = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");
         const productLineData = await ProductLine.findOne({
            where: {
               id,
            },
         });

         if (!productLineData)
            return res.status(404).json("product line is not found");

         const { id: productLine_id } = productLineData;

         await ProductLine.destroy({ where: { id: productLine_id } });

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

         if (!data || !id)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const productLineData = await ProductLine.findOne({
            where: {
               id,
            },
         });

         if (!productLineData)
            return res.status(404).json("product line not found");

         await ProductLine.update(
            {
               ...data,
            },
            { where: { id: productLineData.id } }
         );

         return res.status(200).json(productLineData.id);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
}
export default new Controller();
