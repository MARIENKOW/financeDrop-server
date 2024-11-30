import { Router } from "express";
import autAdminMiddelware from "../middlewares/authAdmin-middleware.js";
import ProductLineController from "../controllers/productline-controller.js";

const ProductLineRouter = new Router();

ProductLineRouter.post("/", autAdminMiddelware, ProductLineController.create);
ProductLineRouter.get("/", ProductLineController.getAll);
ProductLineRouter.get(
   "/:id",
   autAdminMiddelware,
   ProductLineController.getById
);
ProductLineRouter.delete(
   "/:id",
   autAdminMiddelware,
   ProductLineController.delete
);
ProductLineRouter.put("/:id", autAdminMiddelware, ProductLineController.update);

export default ProductLineRouter;
