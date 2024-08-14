import bcrypt from "bcrypt";
import { v4 } from "uuid";
import mailService from "../services/mail-service.js";
import token from "../services/token-service.js";
import { User } from "../models/User.js";
import { Activate } from "../models/Activate.js";
import { Op } from "sequelize";
import { sequelize } from "../services/DB.js";
import { RememberPass } from "../models/RememberPass.js";
import config from "../config.js";
import { Img } from "../models/Img.js";
import { CheckUp } from "../models/CheckUp.js";
import { depositTypes, Event } from "../models/Event.js";
import imgService from "../services/img-service.js";
import userService from "../services/user-service.js";
import { ChangePass } from "../models/ChangePass.js";
import { Referral } from "../models/Referral.js";
import { CashOut, cashOutTypes } from "../models/CashOut.js";
import eventService from "../services/event-service.js";
import telegramService from "../services/telegram-service.js";

class Controller {
   signIn = async (req, res) => {
      try {
         const { email, password } = req.body;

         if (!email || !password)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const userData = await User.findOne({
            where: { email },
            include: Img,
         });

         if (!userData)
            return res.status(400).json({ email: "Email is not defined" });

         const dbPass = userData.password;
         const isPassEquals = await bcrypt.compare(password, dbPass);

         if (!isPassEquals)
            return res
               .status(400)
               .json({ password: "Password is not correct" });

         if (!userData.isActivated)
            return res.status(400).json({
               "root.server": "Account is not activated. check your email",
            });

         const tokens = token.generateTokens({
            id: userData.id,
            role: "user",
         });
         await token.saveTokenUser(userData.id, tokens.refreshToken);
         await res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: config.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
            httpOnly: true,
            // secure: true,   //mandatory
            // sameSite: 'none', // mandatory
            // path: "/"  // mandatory
         });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json({
            accessToken: tokens.accessToken,
            user: userFullInfo,
         });
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };

   signUp = async (req, res) => {
      try {
         const { username, name, email, password, rePassword, referralToken } =
            req.body;

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
            await User.destroy({
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
            const fromUser = await User.findOne({
               where: { uuid: referralToken },
            });

            if (fromUser) {
               const { id: from_id } = fromUser;
               await Referral.create({ to_id: id, from_id });
            }

            await Activate.create({
               user_id: id,
               token: activationLink,
            });
            await mailService.sendMessage(
               email,
               `${process.env.CLIENT_URL}${config.CLIENT_ACTIVATE_ROUTE}/${activationLink}`
            );
            const tokens = token.generateTokens({ id, role: "user" });
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
            role: "user",
         });
         await token.saveTokenUser(userData.id, tokens.refreshToken);
         await res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: config.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, //days
            httpOnly: true,
            // secure: true,   //mandatory
            // sameSite: 'none', // mandatory
            // path: "/"  // mandatory
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

         const userFullInfo = await userService.fullInfo(userData);

         return res.json(userFullInfo);
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

         if (rememberPassData)
            return res.status(400).json({
               "root.server": "The password reset email has already been send.",
            });

         const rememberPassLink = v4();

         const rememberPassDataNew = await RememberPass.create({
            rememberPassLink,
            user_id: userData.id,
         });
         try {
            await mailService.sendMessage(
               userData.email,
               `${process.env.CLIENT_URL}${config.CLIENT_CHANGE_PASSWORD_ROUTE}/${rememberPassLink}`,
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
            { password: hashPassword, refreshToken: null },
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

   getAll = async (req, res) => {
      try {
         const usersData = await User.findAll({
            where: {
               isActivated: 1,
            },
            include: [
               {
                  model: Activate,
                  as: "activate",
                  required: false,
               },
               { model: Img, as: "img", required: false },
            ],
            attributes: {
               exclude: ["password", "refreshToken", "isActivated"],
            },
         });

         return res.json(usersData);
      } catch (e) {
         res.status(500).json(e.message);
         console.log(e);
      }
   };

   getById = async (req, res) => {
      try {
         const { id } = req.params;
         if (!id) return res.status(400).json("id is not found");

         const userData = await User.findOne({
            where: {
               isActivated: 1,
               id,
            },
            attributes: {
               exclude: ["password", "refreshToken", "isActivated"],
            },
            include: Img,
         });

         if (!userData) return res.status(404).json("Not found User");

         const userFullInfo = await userService.fullInfo(userData);

         return res.json(userFullInfo);
      } catch (e) {
         res.status(500).json(e.message);
         console.log(e);
      }
   };
   createOtherDeposit = async (req, res) => {
      try {
         const { sum, description, user_id } = req.body;

         if (!sum || !description || !user_id)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const { id: checkUp_id } = await CheckUp.findOne({
            order: [["date", "desc"]],
         });

         const { otherDeposit, id } = await User.findOne({
            where: { id: user_id },
         });

         const eventData = await Event.create({
            sum,
            name: description,
            user_id,
            checkUp_id,
            deposit_type: 3,
         });
         console.log(parseFloat(otherDeposit), sum);
         try {
            await User.update(
               {
                  otherDeposit: (
                     parseFloat(otherDeposit) + parseFloat(sum)
                  ).toFixed(2),
               },
               { where: { id } }
            );
         } catch (error) {
            await eventData.destroy();
            throw error;
         }

         res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   cashOut = async (req, res) => {
      try {
         const { sum, description, deposit_type, user_id } = req.body;

         if (!sum || !user_id || !deposit_type)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const { id: checkUp_id } = await CheckUp.findOne({
            order: [["date", "desc"]],
         });

         const userData = await User.findOne({
            where: { id: user_id },
         });

         if (!userData)
            return res.status(400).json({ "root.server": "User is not found" });

         const { [depositTypes[deposit_type]]: deposit, id } = userData;

         const newDepositSum = parseFloat(deposit) - parseFloat(sum);

         if (newDepositSum < 0)
            return res.status(400).json({ sum: "not enough money on deposit" });

         const eventData = await Event.create({
            sum,
            name: description ? `cash out: ${description}` : "cash out",
            user_id: id,
            checkUp_id,
            deposit_type,
            increment: 0,
         });

         try {
            await User.update(
               {
                  [depositTypes[deposit_type]]: newDepositSum.toFixed(2),
               },
               { where: { id } }
            );
         } catch (error) {
            await eventData.destroy();
            throw error;
         }

         res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   deleteImgSettings = async (req, res) => {
      try {
         const { img_id, id } = await User.findOne({
            where: { id: req?.user?.id },
         });

         await imgService.delete(img_id);

         const userData = await User.findOne({ where: { id }, include: Img });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json(userFullInfo);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   createImgSettings = async (req, res) => {
      try {
         const img = req.files.img;

         if (!img)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const { img_id } = await imgService.save(img);

         await User.update({ img_id }, { where: { id: req?.user?.id } });

         const userData = await User.findOne({
            where: { id: req?.user?.id },
            include: Img,
         });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json(userFullInfo);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   updateName = async (req, res) => {
      try {
         const { name } = req.body;

         if (!name)
            return res.status(400).json({ "root.server": "Incorrect values" });

         await User.update({ name }, { where: { id: req?.user?.id } });

         const userData = await User.findOne({
            where: { id: req?.user?.id },
            include: Img,
         });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json(userFullInfo);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   updateAddressMatic = async (req, res) => {
      try {
         const { addressMatic } = req.body;

         if (!addressMatic)
            return res.status(400).json({ "root.server": "Incorrect values" });

         await User.update({ addressMatic }, { where: { id: req?.user?.id } });

         const userData = await User.findOne({
            where: { id: req?.user?.id },
            include: Img,
         });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json(userFullInfo);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   updateUsername = async (req, res) => {
      try {
         const { username } = req.body;

         if (!username)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const userDataDublicat = await User.findOne({
            where: { username },
         });

         if (userDataDublicat)
            return res
               .status(400)
               .json({ username: "Username is already taken" });

         await User.update({ username }, { where: { id: req?.user?.id } });

         const userData = await User.findOne({
            where: { id: req?.user?.id },
            include: Img,
         });

         const userFullInfo = await userService.fullInfo(userData);

         res.status(200).json(userFullInfo);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   changePassSettings = async (req, res, user_id) => {
      try {
         const { password, rePassword, currentPassword } = req.body;

         const userData = await User.findOne({ where: { id: req?.user?.id } });

         if (!userData)
            return res
               .status(400)
               .json({ "root.server": "User is not defined" });

         const dbPass = userData.password;
         const isPassEquals = await bcrypt.compare(currentPassword, dbPass);

         if (!isPassEquals)
            return res
               .status(400)
               .json({ currentPassword: "Password is not correct" });

         if (password !== rePassword)
            return res
               .status(400)
               .json({ rePassword: "Re-entered password is not correct" });

         await ChangePass.destroy({
            where: {
               user_id: userData.id,
               dateEndChange: { [Op.lt]: sequelize.fn("NOW") },
            },
         });

         const changePassData = await ChangePass.findOne({
            where: {
               user_id: userData.id,
               dateEndChange: { [Op.gte]: sequelize.fn("NOW") },
            },
         });

         if (changePassData)
            return res.status(400).json({
               "root.server":
                  "The password change email has already been send.",
            });

         const changePassLink = v4();
         const hashPassword = await bcrypt.hash(password, 5);

         const changePassDataNew = await ChangePass.create({
            changePassLink,
            user_id: userData.id,
            password: hashPassword,
         });
         try {
            await mailService.sendMessage(
               userData.email,
               `${process.env.CLIENT_URL}${config.CLIENT_CHANGE_PASSWORD_CONFIRM_ROUTE}/${changePassLink}`,
               "change"
            );
         } catch (error) {
            await changePassDataNew.destroy();
            throw error;
         }
         res.json(userData.email);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
   confirmChangePassSettings = async (req, res) => {
      try {
         const { changePassLink } = req.body;

         if (!changePassLink) return res.status(404).json("Not valid request");

         const changePassData = await ChangePass.findOne({
            where: {
               changePassLink,
               user_id: req?.user?.id,
               dateEndChange: { [Op.gte]: sequelize.fn("NOW") },
            },
         });

         if (!changePassData) return res.status(404).json("Token is not found");

         await User.update(
            { refreshToken: null, password: changePassData.password },
            { where: { id: req?.user?.id } }
         );

         await changePassData.destroy();

         res.json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message);
      }
   };
   checkCashOutRequest = async (req, res) => {
      try {
         const { sum, deposit_type } = req.body;

         if (!sum || !deposit_type)
            return res.status(400).json({ "root.server": "Incorrect values" });

         const userData = await User.findOne({
            where: { id: req?.user?.id },
         });

         const { [depositTypes[deposit_type]]: deposit } = userData;

         const newDepositSum = parseFloat(deposit) - parseFloat(sum);

         if (newDepositSum < 0)
            return res.status(400).json({ "root.server": "Not enough money on deposit" });

         const cashOutData = await CashOut.findOne({
            where: {
               user_id: req?.user?.id,
               deposit_type,
               type: 1,
            },
         });

         if (cashOutData)
            return res.status(403).json({
               "root.server":
                  "Request with current deposit already exists, wait for the operator to process the request.",
            });

         return res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   cashOutRequest = async (req, res) => {
      try {
         const { sum, addressMatic, deposit_type } = req.body;
         console.log(sum, addressMatic, deposit_type);

         const img = req?.files?.img;

         if (!sum || !addressMatic || !deposit_type)
            return res.status(400).json("Incorrect values");

         const cashOutData = await CashOut.findOne({
            where: {
               user_id: req?.user?.id,
               deposit_type,
               type: 1,
            },
         });

         if (cashOutData) return res.status(403).json("Request already exists");

         let img_id = null;
         let img_path = null;
         if (img) {
            const imgData = await imgService.save(img);
            img_id = imgData?.img_id;
            img_path = imgData?.path;
         }

         try {
            await CashOut.create({
               user_id: req?.user?.id,
               deposit_type,
               type: 1,
               sum,
               img_id,
               addressMatic,
            });
         } catch (error) {
            if (img) {
               await imgService.delete(img_id);
            }
            throw error;
         }
         const userData = await User.findOne({ where: { id: req?.user?.id } });
         await telegramService.send(`
            Username: @${userData?.username}\nEmail: ${
            userData?.email
         }\nAddress Matic: ${addressMatic}\nSum: $ ${sum}\nDeposit: ${
            depositTypes[deposit_type]
         }\n${img_path ? "Screenshot: " + process.env.API_URL + img_path : ""}
            `);

         return res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getCashOutRequestPending = async (req, res) => {
      try {
         const user_id = req?.user?.id || req?.params?.id;

         if (!user_id) return res.status(400).json("Incorrect values");

         const cashOutData = await CashOut.findAll({
            order: [
               ["date", "desc"],
               ["id", "desc"],
            ],
            where: {
               user_id,
               type: 1,
            },
            include: [
               {
                  model: Img,
                  as: "img",
               },
            ],
         });
         console.log(cashOutData);

         return res.status(200).json(eventService.filterEvent(cashOutData));
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   rejectCashOut = async (req, res) => {
      try {
         const { adminMessage } = req?.body;
         const id = req?.params?.id;

         if (!id) return res.status(400).json("Incorrect values");

         const cashOutData = await CashOut.findOne({
            where: {
               id,
               type: 1,
            },
         });

         if (!cashOutData) return res.status(400).json("Incorrect values");

         await CashOut.update(
            { type: 3, adminMessage, date: sequelize.fn("CURDATE") },
            {
               where: {
                  id,
                  type: 1,
               },
            }
         );

         return res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   confirmCashOut = async (req, res) => {
      try {
         const id = req?.params?.id;

         if (!id) return res.status(400).json("Incorrect values");

         const cashOutData = await CashOut.findOne({
            where: {
               id,
               type: 1,
            },
         });

         if (!cashOutData) return res.status(400).json("Incorrect values");

         const { sum, deposit_type, user_id } = cashOutData.dataValues;

         if (!sum || !user_id || !deposit_type)
            throw new Error("not correct cashOut data");

         const { id: checkUp_id } = await CheckUp.findOne({
            order: [["date", "desc"]],
         });

         const userData = await User.findOne({
            where: { id: user_id },
         });

         if (!userData) throw new Error("not correct cashOut data");

         const { [depositTypes[deposit_type]]: deposit, id: userData_id } =
            userData;

         const newDepositSum = parseFloat(deposit) - parseFloat(sum);

         if (newDepositSum < 0) {
            await CashOut.update(
               {
                  type: 3,
                  adminMessage: "Not enough money on deposit",
                  date: sequelize.fn("CURDATE"),
               },
               {
                  where: {
                     id,
                     type: 1,
                  },
               }
            );
            return res.status(403).json("not enough money on deposit");
         }

         const eventData = await Event.create({
            sum,
            name: "cash out",
            user_id: userData_id,
            checkUp_id,
            deposit_type,
            increment: 0,
         });

         try {
            await User.update(
               {
                  [depositTypes[deposit_type]]: newDepositSum.toFixed(2),
               },
               { where: { id: userData_id } }
            );
         } catch (error) {
            await eventData.destroy();
            throw error;
         }

         await CashOut.update(
            { type: 2, date: sequelize.fn("CURDATE") },
            {
               where: {
                  id,
                  type: 1,
               },
            }
         );
         return res.status(200).json(true);
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
   getCashOutRequestHistory = async (req, res) => {
      try {
         const user_id = req?.user?.id || req?.params?.id;
         // console.log(req?.user);

         if (!user_id) return res.status(400).json("Incorrect values");

         const cashOutData = await CashOut.findAll({
            order: [
               ["date", "desc"],
               ["id", "desc"],
            ],
            where: {
               user_id,
               type: [2, 3],
            },
            include: [
               {
                  model: Img,
                  as: "img",
               },
            ],
         });
         console.log(cashOutData);

         return res.status(200).json(eventService.filterEvent(cashOutData));
      } catch (e) {
         console.log(e);
         res.status(500).json(e?.message);
      }
   };
}
export default new Controller();
