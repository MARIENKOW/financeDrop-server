import { Router, json } from "express";
import otherUpController from "../controllers/otherUp-controller.js";
import autUserMiddelware from "../middlewares/authUser-middleware.js";
import changePassMiddleware from "../middlewares/changePass-middleware.js";
import authAdminMiddelware from "../middlewares/authAdmin-middleware.js";


const OtherUpRouter = new Router();

OtherUpRouter.post("/create", authAdminMiddelware, otherUpController.create);



export default OtherUpRouter;
