const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET_KEY; // Store this in env file!

exports.auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
