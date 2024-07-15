import token from '../services/token-service.js';
import DB from '../services/DB.js';

const changePassMiddleware = async (req, res, next) => {
   try {
      const { rememberPassLink } = req.body
      if (!rememberPassLink) {
         return res.status(403).json('Not valid request')
      }

      const [rezult] = await DB.query(`SELECT * from rememberPass where rememberPassLink = '${rememberPassLink}'`)

      if(rezult.length ===  0) {
         return res.status(403).json('Token is not found')
      }
      const [response] = await DB.query(`SELECT * from rememberPass where rememberPassLink = '${rememberPassLink}' and dateEndChange > now()`)

      if(response.length ===  0) {
         return res.status(403).json('Time to change pass is gone')
      }

      next();
   } catch (e) {
      res.status(500).json('some Error in middleware')
   }
}

export default changePassMiddleware;