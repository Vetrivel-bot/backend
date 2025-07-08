const UserSchema = require("../Model/UserModel");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET_KEY; // Store this in env file!
const bcrypt = require("bcrypt");
const UserModel = require("../Model/UserModel");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "28d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 28 * 24 * 60 * 60 * 27000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash with salt rounds
    const newUser = new UserSchema({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: "28d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 28 * 24 * 60 * 60 * 28000,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.profile = async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify token and extract user ID
    const { id } = jwt.verify(token, SECRET);

    // Fetch user and omit password
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data
    res.status(200).json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  // Prevent caching
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(200).json({ message: "Logout successful" });
};
