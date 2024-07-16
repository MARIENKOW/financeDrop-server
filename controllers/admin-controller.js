import DB from '../services/DB.js';
import bcrypt from 'bcrypt'
import { v4 } from 'uuid';
import token from '../services/token-service.js';


class Controller {

   // signIn = async (req, res) => {
   //    try {
   //       const { name, password } = req.body;
   //       const hashPassword = await bcrypt.hash(password, 5);
   //       const [info] = await DB.query(`INSERT INTO admin VALUES (NULL, '${name}',  '${hashPassword}', NULL );`)
   //       const tokens = token.generateTokens({ id: info.insertId, email })
   //       await token.saveTokenUser(info.insertId, tokens.refreshToken);
   //    } catch (e) {
   //       console.log(e);
   //       res.status(500).json(e.message)
   //    }
   // }
   signIn = async (req, res) => {
      try {
         const { name, password } = req.body;
         if (!name || !password) return res.status(400).json({ 'root.server':'Incorrect values' })
         const [admin] = await DB.query(`SELECT * from admin where name = '${name}'`);
         if (admin.length === 0) return res.status(400).json({name:'Name is not defined'})
         const dbPass = admin[0].password;
         const isPassEquals = await bcrypt.compare(password, dbPass);
         if (!isPassEquals) return res.status(400).json({password:'Password is not correct'})
         const tokens = token.generateTokens({ id: admin[0].id, name })
         await token.saveTokenAdmin(admin[0].id, tokens.refreshToken);
         await res.cookie('refreshTokenAdmin', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
         res.status(200).json({
            accessTokenAdmin: tokens.accessToken,
            admin: admin[0]
         })
      } catch (e) {
         console.log(e);
         res.status(500).json(e.message)
      }
   }

   logOut = async (req, res) => {
      try {
         const { refreshTokenAdmin } = req.cookies;
         res.clearCookie('refreshTokenAdmin')
         await token.removeTokenAdmin(refreshTokenAdmin);
         res.status(200).json(true)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }

   refresh = async (req, res) => {
      try {
         const { refreshTokenAdmin } = req.cookies;
         if (!refreshTokenAdmin) return res.status(401).json('not authorized');

         const ansData = token.validateRefreshToken(refreshTokenAdmin);
         const adminData = await token.findTokenAdmin(refreshTokenAdmin);
         if (!ansData || !adminData) return res.status(401).json('not authorized');
         const tokens = token.generateTokens({ id: adminData.id, name: adminData.name })
         await token.saveTokenAdmin(adminData.id, tokens.refreshToken);
         await res.cookie('refreshTokenAdmin', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
         res.status(200).json(tokens.accessToken)
      } catch (e) {
         res.status(500).json(e.message)
      }
   }

   aboutAdmin = async (req, res) => {
      try {
         const { refreshTokenAdmin } = req.cookies
         if (!refreshTokenAdmin) return res.status(401).json('not Authorization')
         const adminData = await token.findTokenAdmin(refreshTokenAdmin);
         const ansData = token.validateRefreshToken(refreshTokenAdmin);
         if (!ansData || !adminData) return res.status(401).json('not Authorization')
         return res.json(adminData)
      } catch (e) {
         res.status(500).json(e.message)
         console.log(e);
      }
   }
}
export default new Controller();

