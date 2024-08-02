import { Router } from "express";
import siteController from "../controllers/site-controller.js";

const SiteRouter = new Router();

SiteRouter.get("/getData", siteController.getData);

export default SiteRouter;
