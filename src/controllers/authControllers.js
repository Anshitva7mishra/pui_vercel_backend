import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import { logger } from "../utils/logger.js";

const COOKIE_BASE = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const socialCallback = (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (!req.user) {
      return res.redirect(`${clientUrl}/404`);
    }

    const accessToken = signAccessToken(req.user._id);
    const refreshToken = signRefreshToken(req.user._id);

    res.cookie("accessToken", accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(clientUrl);
  } catch (err) {
    logger.error(`Social Callback Error: ${err.message}`);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/500`);
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
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = (_req, res) => {
  const clearOptions = { ...COOKIE_BASE, maxAge: 0 };

  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);

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
