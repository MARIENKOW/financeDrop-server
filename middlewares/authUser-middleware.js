import token from "../services/token-service.js";

const authMiddleware = (req, res, next) => {

   try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) return res.status(401).json("not authorized");

      const accessToken = authorizationHeader.split(" ")[1];

      if (!accessToken) return res.status(401).json("not authorized");

      const userData = token.validateAccessToken(accessToken);
      if (!userData) return res.status(401).json("not authorized");

      if (userData.role !== "user")
         return res.status(401).json("not authorized");

      req.user = userData;
      next();
   } catch (e) {
      console.log(e);
      return res.status(500).json("some Error in middleware");
   }
};

export default authMiddleware;
