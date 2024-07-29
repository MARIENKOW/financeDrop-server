import { OtherUp } from "../models/OtherUp.js";

class Controller {
   create = async (req, res) => {
      try {
         const { sum, description, user_id } = req.body;

         if (!sum || !description || !user_id)
            return res.status(400).json({ "root.server": "Incorrect values" });

         await OtherUp.create({ sum, description, user_id });

         res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
}
export default new Controller();
