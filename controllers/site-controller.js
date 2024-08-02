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
}
export default new Controller();
