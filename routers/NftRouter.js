import { Router } from "express";
import autAdminMiddelware from "../middlewares/authAdmin-middleware.js";
import authUserAdminMiddelware from "../middlewares/authUser-Admin-middleware.js";
import authMiddleware from "../middlewares/authUser-middleware.js";
import nftController from "../controllers/nft-controller.js";
import { v4 } from "uuid";
import multer from "multer";

const storage = multer.diskStorage({
   destination: function (req, file, callback) {
      callback(null, "./uploads/nft/");
   },
   filename: function (req, file, callback) {

      req.fileName = v4() + file.originalname
      callback(null,req.fileName);
   },
});

const upload = multer({ storage }).single("img");

const NftRouter = new Router();

NftRouter.post("/create", autAdminMiddelware, nftController.create);
NftRouter.get("/getNotSold", authUserAdminMiddelware, nftController.getNotSold);
NftRouter.get("/:id", authUserAdminMiddelware, nftController.getById);
NftRouter.delete("/:id", autAdminMiddelware, nftController.delete);
NftRouter.post("/update/:id", autAdminMiddelware, nftController.update);
NftRouter.post("/sendNft/:id", autAdminMiddelware, nftController.sendNft);

export default NftRouter;
