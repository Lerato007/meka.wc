import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  console.log("🔐 protect hit on:", req.method, req.path);
  console.log("🍪 cookies:", req.cookies);
  console.log("🎫 token exists:", !!token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ decoded:", decoded);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.error("❌ token error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.log("❌ no token in cookies");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };