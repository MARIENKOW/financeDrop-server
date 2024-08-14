import { Site } from "../models/Site.js";

class Controller {
   getData = async (req, res) => {
      try {
         const data = await Site.findOne();
         res.status(200).json(data);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
   changeWallet = async (req, res) => {
      try {
         const { wallet } = req?.body;

         if (!wallet)
            return res.status(400).json({ "root.server": "Incorrect values" });
         const { referralPercent } = await Site.findOne();

         await Site.update({ wallet }, { where: { referralPercent } });

         const siteData = await Site.findOne();
         res.status(200).json(siteData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
   changeReferralPercent = async (req, res) => {
      try {
         const { referralPercent } = req?.body;

         if (!referralPercent)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const { referralPercent: referralPercentData } = await Site.findOne();

         await Site.update(
            { referralPercent },
            { where: { referralPercent: referralPercentData } }
         );

         const siteData = await Site.findOne();
         res.status(200).json(siteData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
   changeCashOutPercent = async (req, res) => {
      try {
         const { cashOutPercent } = req?.body;

         if (!cashOutPercent)
            return res.status(400).json({ "root.server": "Incorrect values" });
         const { referralPercent } = await Site.findOne();

         await Site.update({ cashOutPercent }, { where: { referralPercent } });

         const siteData = await Site.findOne();
         res.status(200).json(siteData);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
}
export default new Controller();
