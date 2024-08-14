import token from "../services/token-service.js";

const authMiddleware = (req, res, next) => {

   try {
      const authorizationHeader = req.headers.authorization;
      
      console.log(authorizationHeader,'1111111');
      if (!authorizationHeader) return res.status(401).json("not authorized");
      
      const accessToken = authorizationHeader.split(" ")[1];
      
      console.log(accessToken,'222222');
      if (!accessToken) return res.status(401).json("not authorized");
      
      const userData = token.validateAccessToken(accessToken);
      console.log(userData,'333333');
      if (!userData) return res.status(401).json("not authorized");
      
      console.log(userData.role,'44444');
      if (userData.role !== "user")
         return res.status(401).json("not authorized");

      req.user = userData;
      console.log('next');
      next();
   } catch (e) {
      console.log(e);
      return res.status(500).json("some Error in middleware");
   }
};

export default authMiddleware;
