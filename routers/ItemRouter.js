import { Router } from "express";
import autAdminMiddelware from "../middlewares/authAdmin-middleware.js";
import ItemController from "../controllers/item-controller.js";
import { v4 } from "uuid";
import multer from "multer";

const storage = multer.diskStorage({
   destination: function (req, file, callback) {
      callback(null, "./uploads/nft/");
   },
   filename: function (req, file, callback) {
      req.fileName = v4() + file.originalname;
      callback(null, req.fileName);
   },
});

const upload = multer({ storage }).single("img");

const ItemRouter = new Router();

ItemRouter.post("/", autAdminMiddelware, ItemController.create);
ItemRouter.get("/byLine/:id", ItemController.getByLine);
ItemRouter.get("/:id", autAdminMiddelware, ItemController.getById);
ItemRouter.delete("/:id", autAdminMiddelware, ItemController.delete);
ItemRouter.put("/:id", autAdminMiddelware, ItemController.update);

export default ItemRouter;
