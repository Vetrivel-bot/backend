const express = require("express");
const {
  profile,
  login,
  signup,
  logout,
} = require("../Controller/UserController");
const { auth } = require("../Middleware/auth");
const router = express.Router();
router.get("/profile", profile);

router.post("/login", login);
router.post("/signup", signup);
router.get("/logout", auth, logout);

module.exports = router;
