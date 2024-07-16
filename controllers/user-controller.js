import DB from '../services/DB.js';
import bcrypt from 'bcrypt'
import { v4 } from 'uuid';
import mailService from '../services/mail-service.js'
import token from '../services/token-service.js';


class Controller {

   signIn = async (req, res) => {
      try {
         const { email, password } = req.body;
         if (!email || !password) return res.status(400).json({ 'root.server':'Incorrect values' })
         const [mailFromDB] = await DB.query(`SELECT * from user where email = '${email}'`);
         if (mailFromDB.length === 0) return res.status(400).json({email:'Email is not defined'})
         const dbPass = mailFromDB[0].password;
         const isPassEquals = await bcrypt.compare(password, dbPass);
         if (!isPassEquals) return res.status(400).json({password:'Password is not correct'})
         if (!mailFromDB[0].isActivated) return res.status(400).json({'root.server':'Account is not activated. check your email'})
         const tokens = token.generateTokens({ id: mailFromDB[0].id, email })
         await token.saveTokenUser(mailFromDB[0].id, tokens.refreshToken);
         await res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
         res.status(200).json({
            accessToken: tokens.accessToken,
            user: mailFromDB[0]
         })
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message)
      }
   }

   signUp = async (req, res) => {
      try {
         const clientError = {
            badValidation: false,
            notUniqueEmail: false,
            notUniqueUsername: false,
         }
         const { username, name, email, password, rePassword } = req.body;

         if (!username || !email || !password || !rePassword || !name || password !== rePassword) return res.status(400).json({'root.server':'Incorrect values'})
            
         await DB.query(`DELETE user FROM user INNER JOIN Activate ON user.id = Activate.user_id WHERE user.isActivated = 0 and Activate.date_end < NOW() and user.id not in (SELECT user_id from Activate where date_end > NOW())`);

         const [rezultUsername] = await DB.query(`SELECT username from user where BINARY username = '${username}'`)

         if (rezultUsername.length > 0) return res.status(400).json({ username:'Username is already taken' })

         const [rezult] = await DB.query(`SELECT email from user where email = '${email}'`)

         if (rezult.length > 0) return res.status(400).json({ email:'Email is already taken' })

         const hashPassword = await bcrypt.hash(password, 5);
         const activationLink = v4();
         const [info] = await DB.query(`INSERT INTO user VALUES (NULL, '${username}', '${email}', '${hashPassword}','${name}', NULL , false);`)
         try{
            await DB.query(`INSERT INTO Activate VALUES ('${activationLink}','${info.insertId}',TIMESTAMPADD(MINUTE,30,NOW()),NULL)`)
            await mailService.sendMessage(email, `${process.env.CLIENT_URL}/Activate/${activationLink}`)
            const tokens = token.generateTokens({ id: info.insertId, email })
            await token.saveTokenUser(info.insertId, tokens.refreshToken);
         }catch(e){
            await DB.query(`DELETE FROM user WHERE id = '${info.insertId}'`);
            throw new Error()
         }
         res.status(200).json(email)
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message)
      }
   }

   activate = async (req, res) => {
      try {
         const { token } = req.body
         const [activate] = await DB.query(`SELECT * from Activate where token = '${token}' and date_end > NOW()`);
         if (activate.length === 0) return res.status(400).json('Activation token is not found');
         await DB.query(`UPDATE user set isActivated = true where id = ${activate[0].user_id}`);
         await DB.query(`DELETE FROM Activate where token = '${token}'`);
         res.status(200).json(true)
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message)
      }
   }

   logOut = async (req, res) => {
      try {
         const { refreshToken } = req.cookies;
         res.clearCookie('refreshToken')
         await token.removeTokenUser(refreshToken);
         res.status(200).json(true)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }

   refresh = async (req, res) => {
      try {
         const { refreshToken } = req.cookies;
         if (!refreshToken) return res.status(401).json('not authorized user');

         const ansData = token.validateRefreshToken(refreshToken);
         const userData = await token.findTokenUser(refreshToken);
         if (!ansData || !userData) return res.status(401).json('not authorized user');
         const tokens = token.generateTokens({ id: userData.id, email: userData.email })
         await token.saveTokenUser(userData.id, tokens.refreshToken);
         await res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
         res.status(200).json(tokens.accessToken)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }

   aboutUser = async (req, res) => {
      try {
         const { refreshToken } = req.cookies
         if (!refreshToken) return res.status(401).json('not Authorization')
         const userData = await token.findTokenUser(refreshToken);
         const ansData = token.validateRefreshToken(refreshToken);
         if (!ansData || !userData) return res.status(401).json('not Authorization')
         return res.json(userData)
      } catch (e) {
         res.status(500).json(e.message)
         console.log(e);
      }
   }

   rememberPassword = async (req, res) => {
      try {
         const { email } = req.body;
         const [rezult] = await DB.query(`SELECT * from user where email = '${email}'`)

         if (rezult.length === 0) return res.status(400).json({ email:'Email is not found' })

         const rememberPassLink = v4();
         const user_id = rezult[0].id;

         await DB.query(`DELETE FROM rememberPass WHERE user_id = ${user_id} and dateEndChange < NOW()`)

         const [alreadySend] = await DB.query(`SELECT * from rememberPass where user_id = '${user_id}' and dateEndChange > NOW()`)

         if (alreadySend.length > 0) return res.status(400).json({ 'root.server':'The password reset email has already been send.' })


         const response = await DB.query(`INSERT into rememberPass values (null,'${rememberPassLink}','${user_id}',TIMESTAMPADD(MINUTE,30,NOW()))`)
         try {
            await mailService.sendMessage(rezult[0].email, `${process.env.CLIENT_URL}/ChangePass/${rememberPassLink}`, 'change')
         } catch (error) {
            await DB.query(`DELETE FROM rememberPass WHERE user_id = ${user_id}`)
            throw new Error(error)
         }
         return res.json(rezult[0].email)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }

   changePass = async (req, res) => {
      try {
         const { rememberPassLink, password, rePassword } = req.body;
         if (password !== rePassword) return res.status(400).json({rePassword:'Re-entered password is not correct'})
         const hashPassword = await bcrypt.hash(password, 5);

         await DB.query(`UPDATE user INNER JOIN rememberPass ON user.id = rememberPass.user_id SET user.password = '${hashPassword}' WHERE rememberPass.rememberPassLink = '${rememberPassLink}'`);
         await DB.query(`DELETE FROM rememberPass WHERE rememberPassLink = '${rememberPassLink}'`)
         res.json(true)
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message)
      }
   }

   checkChangePassLink = async (req, res) => {
      try {
         return res.json(true)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }
}
export default new Controller();

