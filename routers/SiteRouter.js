import { Router } from "express";
import siteController from "../controllers/site-controller.js";
import authAdminMiddleware from "../middlewares/authAdmin-middleware.js";

const SiteRouter = new Router();

SiteRouter.get("/getData", siteController.getData);
SiteRouter.post("/wallet",authAdminMiddleware, siteController.changeWallet);
SiteRouter.post("/referral-percent",authAdminMiddleware, siteController.changeReferralPercent);
SiteRouter.post("/cash-out-percent",authAdminMiddleware, siteController.changeCashOutPercent);

export default SiteRouter;
