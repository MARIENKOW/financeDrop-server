import token from "../services/token-service.js";

const authAdminMiddleware = (req, res, next) => {

   try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) return res.status(401).json("not authorized");

      const accessToken = authorizationHeader.split(" ")[1];

      if (!accessToken) return res.status(401).json("not authorized");

      const adminData = token.validateAccessToken(accessToken);

      if (!adminData) return res.status(401).json("not authorized");

      req.user = adminData;
      next();
   } catch (e) {
      res.status(500).json("some Error in middleware");
      return next("some Error in middleware");
   }
};

export default authAdminMiddleware;
