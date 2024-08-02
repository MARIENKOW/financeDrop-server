import { Router, json } from "express";
import controller from "../controllers/user-controller.js";
import autUserMiddelware from "../middlewares/authUser-middleware.js";
import changePassMiddleware from "../middlewares/changePass-middleware.js";
import authAdminMiddelware from "../middlewares/authAdmin-middleware.js";

const UserRouter = new Router();

UserRouter.post("/signIn", controller.signIn);

UserRouter.post("/signUp", controller.signUp);

UserRouter.post("/logOut", controller.logOut);

UserRouter.get("/refresh", controller.refresh);

UserRouter.post("/activate", controller.activate);

UserRouter.get("/aboutUser", autUserMiddelware, controller.aboutUser);

UserRouter.post("/rememberPassword", controller.rememberPassword);

UserRouter.post("/changePass", changePassMiddleware, controller.changePass);

UserRouter.post(
   "/checkChangePassLink",
   changePassMiddleware,
   controller.checkChangePassLink
);

UserRouter.get("/getAll", authAdminMiddelware, controller.getAll);

UserRouter.get("/:id", authAdminMiddelware, controller.getById);

UserRouter.post(
   "/other-deposit/create",
   authAdminMiddelware,
   controller.createOtherDeposit
);

UserRouter.post("/cash-out", authAdminMiddelware, controller.cashOut);
UserRouter.delete("/img", autUserMiddelware, controller.deleteImgSettings);

UserRouter.post("/img", autUserMiddelware, controller.createImgSettings);

UserRouter.post("/updateName", autUserMiddelware, controller.updateName);

UserRouter.post(
   "/updateAddressMatic",
   autUserMiddelware,
   controller.updateAddressMatic
);
UserRouter.post(
   "/updateUsername",
   autUserMiddelware,
   controller.updateUsername
);

UserRouter.post(
   "/changePassSettings",
   autUserMiddelware,
   controller.changePassSettings
);

UserRouter.post(
   "/changePassSettings/confirm",
   autUserMiddelware,
   controller.confirmChangePassSettings
);

export default UserRouter;
