import bcrypt from "bcrypt";
import { v4 } from "uuid";
import mailService from "../services/mail-service.js";
import token from "../services/token-service.js";
import { User } from "../models/User.js";
import { Activate } from "../models/Activate.js";
import { Op } from "sequelize";
import { sequelize } from "../services/DB.js";
import { RememberPass } from "../models/RememberPass.js";

class Controller {
   signIn = async (req, res) => {
      try {
         const { email, password } = req.body;

         if (!email || !password)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const data = await User.findOne({ where: { email } });

         if (!data)
            return res.status(400).json({ email: "Email is not defined" });

         const { dataValues } = data;
         const dbPass = dataValues.password;
         const isPassEquals = await bcrypt.compare(password, dbPass);

         if (!isPassEquals)
            return res
               .status(400)
               .json({ password: "Password is not correct" });

         if (!dataValues.isActivated)
            return res
               .status(400)
               .json({
                  "root.server": "Account is not activated. check your email",
               });

         const tokens = token.generateTokens({ id: dataValues.id, email });
         await token.saveTokenUser(dataValues.id, tokens.refreshToken);
         await res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
         });
         res.status(200).json({
            accessToken: tokens.accessToken,
            user: dataValues,
         });
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   signUp = async (req, res) => {
      try {
         const { username, name, email, password, rePassword } = req.body;

         if (
            !username ||
            !email ||
            !password ||
            !rePassword ||
            !name ||
            password !== rePassword
         )
            return res.status(400).json({ "root.server": "Incorrect values" });

         const usersToDelete = await User.findAll({
            where: {
               isActivated: 0,
               "$activate.date_end$": {
                  [Op.or]: {
                     [Op.lt]: sequelize.fn("NOW"),
                     [Op.is]: null,
                  },
               },
            },
            include: {
               model: Activate,
               as: "activate",
               required: false,
            },
         });

         if (usersToDelete) {
            const usersIdArr = usersToDelete.map((el) => el.id);
            User.destroy({
               where: {
                  id: {
                     [Op.in]: usersIdArr,
                  },
               },
            });
         }

         const usernameFind = await User.findOne({ where: { username } });

         if (usernameFind)
            return res
               .status(400)
               .json({ username: "Username is already taken" });

         const emailFind = await User.findOne({ where: { email } });

         if (emailFind)
            return res.status(400).json({ email: "Email is already taken" });

         const hashPassword = await bcrypt.hash(password, 5);
         const activationLink = v4();

         const insertUser = await User.create({
            username,
            email,
            password: hashPassword,
            name,
         });

         const { id } = insertUser;

         try {
            await Activate.create({
               user_id: id,
               token: activationLink,
            });
            await mailService.sendMessage(
               email,
               `${process.env.CLIENT_URL}/Activate/${activationLink}`
            );
            const tokens = token.generateTokens({ id, email });
            await token.saveTokenUser(id, tokens.refreshToken);
         } catch (e) {
            await insertUser.destroy();
            throw e;
         }
         res.status(200).json(email);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   activate = async (req, res) => {
      try {
         const { token } = req.body;

         if (!token)
            return res.status(400).json("Activation token is not found");

         const activate = await Activate.findOne({
            where: {
               token,
               date_end: {
                  [Op.gte]: sequelize.fn("NOW"),
               },
            },
         });

         if (!activate)
            return res.status(400).json("Activation token is not found");
         await User.update(
            { isActivated: 1 },
            { where: { id: activate.user_id } }
         );
         await activate.destroy();
         res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   logOut = async (req, res) => {
      try {
         const { refreshToken } = req.cookies;
         res.clearCookie("refreshToken");
         await token.removeTokenUser(refreshToken);
         res.status(200).json(true);
      } catch (e) {
         res.status(500).json(e.message);
      }
   };

   refresh = async (req, res) => {
      try {
         const { refreshToken } = req.cookies;
         if (!refreshToken) return res.status(401).json("not authorized user");

         const ansData = token.validateRefreshToken(refreshToken);
         const userData = await token.findTokenUser(refreshToken);
         if (!ansData || !userData)
            return res.status(401).json("not authorized user");
         const tokens = token.generateTokens({
            id: userData.id,
            email: userData.email,
         });
         await token.saveTokenUser(userData.id, tokens.refreshToken);
         await res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
         });
         res.status(200).json(tokens.accessToken);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   aboutUser = async (req, res) => {
      try {
         const { refreshToken } = req.cookies;
         if (!refreshToken) return res.status(401).json("not Authorization");
         const userData = await token.findTokenUser(refreshToken);
         const ansData = token.validateRefreshToken(refreshToken);
         if (!ansData || !userData)
            return res.status(401).json("not Authorization");
         return res.json(userData);
      } catch (e) {
         res.status(500).json(e.message);
         console.log(e);
      }
   };

   rememberPassword = async (req, res) => {
      try {
         const { email } = req.body;

         const userData = await User.findOne({ where: { email } });

         if (!userData)
            return res.status(400).json({ email: "Email is not found" });

         await RememberPass.destroy({
            where: {
               user_id: userData.id,
               dateEndChange: { [Op.lt]: sequelize.fn("NOW") },
            },
         });

         const rememberPassData = await RememberPass.findOne({
            where: {
               user_id: userData.id,
               dateEndChange: { [Op.gte]: sequelize.fn("NOW") },
            },
         });

         console.log(rememberPassData);
         if (rememberPassData)
            return res
               .status(400)
               .json({
                  "root.server":
                     "The password reset email has already been send.",
               });

         const rememberPassLink = v4();

         const rememberPassDataNew = await RememberPass.create({
            rememberPassLink,
            user_id: userData.id,
         });
         try {
            await mailService.sendMessage(
               userData.email,
               `${process.env.CLIENT_URL}/ChangePass/${rememberPassLink}`,
               "change"
            );
         } catch (error) {
            await rememberPassDataNew.destroy();
            throw error;
         }
         return res.json(userData.dataValues.email);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   changePass = async (req, res, user_id) => {
      try {
         const { password, rePassword } = req.body;
         if (password !== rePassword)
            return res
               .status(400)
               .json({ rePassword: "Re-entered password is not correct" });
         const hashPassword = await bcrypt.hash(password, 5);

         await User.update(
            { password: hashPassword },
            { where: { id: req.user_id } }
         );
         await RememberPass.destroy({ where: { user_id: req.user_id } });
         res.json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   checkChangePassLink = async (req, res) => {
      try {
         return res.json(true);
      } catch (e) {
         res.status(500).json(e.message);
      }
   };
}
export default new Controller();
