const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Check if Authorization header exists
    if (!req.header("Authorization")) {
      return res.status(401).json({
        message: "Authentication failed",
        error: "No authorization token provided",
      });
    }

    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};
