import { v4 } from "uuid";
import { Img } from "../models/Img.js";
import { unlink } from "fs";
import path from "path";

// export const nftImageFolder = "/uploads";

class ImgService {
   save = async (img) => {
      if (!img) throw new Error("img is not found");

      const imgName = v4() + img.name;

      await this.moveFile(img, imgName);

      try {
         const path = process.env.NFT_FOLDER + "/" + imgName;
         const { id: img_id } = await Img.create({ name: imgName, path });
         return { img_id, imgName, path };
      } catch (error) {
         await this.unlinkFile(imgName);
         throw error;
      }
   };
   async moveFile(img, imgName) {
      return new Promise((res, rej) => {
         img.mv(
            path.resolve() + "/" + process.env.NFT_FOLDER + "/" + imgName,
            function (err) {
               if (err) return rej(err);
               res(true);
            }
         );
      });
   }
   async unlinkFile(imgName) {
      return new Promise((res, rej) => {
         unlink(
            path.resolve() + process.env.NFT_FOLDER + "/" + imgName,
            (err) => {
               if (err) return rej(err);
               res(true);
            }
         );
      });
   }

   async delete(img_id) {
      if (!img_id) throw new Error("img_id is not found");

      const { name: imgName, id } = await Img.findOne({
         where: { id: img_id },
      });

      await Img.destroy({ where: { id: img_id } });

      return this.unlinkFile(imgName);
   }
}

export default new ImgService();
