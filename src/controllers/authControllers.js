import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import { logger } from "../utils/logger.js";


const COOKIE_BASE = {
  httpOnly: true,
  secure: true, 
  sameSite: "none", 
  path: "/",
  partitioned: true, 
};

export const socialCallback = (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (!req.user) {
      logger.warn("Social Callback: No user found in request");
      return res.redirect(`${clientUrl}/auth/login?error=no_user`);
    }

    const accessToken = signAccessToken(req.user._id);
    const refreshToken = signRefreshToken(req.user._id);

    // Set Access Token
    res.cookie("accessToken", accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set Refresh Token
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`User ${req.user._id} logged in via Social Auth`);

    // Redirect to frontend (optionally add a query param so frontend knows to refetch user)
    return res.redirect(`${clientUrl}?login=success`);
  } catch (err) {
    logger.error(`Social Callback Error: ${err.message}`);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/auth/login?error=server_error`);
  }
};

export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = signAccessToken(decoded.id);

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Refresh Token Error: ${err.message}`);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = (_req, res) => {
  const clearOptions = { ...COOKIE_BASE, maxAge: 0 };

  // Clear Auth Cookies
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);

  // Clear CSRF Cookie (match the exact options used when creating it)
  res.clearCookie("csrfToken", {
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.status(200).json({ success: true, user: req.user });
};
