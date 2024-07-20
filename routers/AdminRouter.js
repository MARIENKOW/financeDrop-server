import { Router } from "express";
import adminController from "../controllers/admin-controller.js";
import autAdminMiddelware from "../middlewares/authAdmin-middleware.js";

const AdminRouter = new Router();

AdminRouter.post("/signIn", adminController.signIn);

AdminRouter.post("/logOut", adminController.logOut);

AdminRouter.get("/refresh", adminController.refresh);

AdminRouter.get("/aboutAdmin", autAdminMiddelware, adminController.aboutAdmin);

export default AdminRouter;
