const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes'); // Adjust based on how you handle status codes

// User authorization to get access to routes for authenticated users
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log("You are not authenticated");
    return res.status(HttpStatus.FORBIDDEN).json("You are not authenticated");
  }

  const access_token = authHeader.split(" ")[1];
  console.log(access_token,"token,,,,,,,,,,,,,,,,,,");
  
  
  jwt.verify(access_token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token is not valid");
      return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: "Token is not valid" });
    } else {
        console.log(user,"userrrrr");
        
      req.user = user; // Attach the decoded user information to the request object
      return next();  // Allow the request to proceed
    }
  });
}

module.exports = authenticateUser;



// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../model/userModal');

// const authMiddleware = async (req, res, next) => {
//     // Get the token from the Authorization header
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     console.log(token,"midleeee");
    
//     if (!token) {
//         return res.status(401).json({ error: 'No token, authorization denied' });
//     }

//     try {
//         // Verify the token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Find the user associated with the token
//         const user = await User.findById(decoded.id);
//         console.log(user,"user middleeeeee");
        
//         if (!user) {
//             return res.status(401).json({ error: 'Invalid token' });
//         }

//         // Attach user to the request object
//         req.user = user;
//         next();  // Proceed to the next middleware/controller
//     } catch (error) {
//         res.status(401).json({ error: 'Token verification failed' });
//     }
// };

// module.exports = authMiddleware;

