import express from "express";
import passport from "passport";
import {
  socialCallback,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import { generateCsrfToken } from "../middlewares/csrfMiddleware.js"; 

const router = express.Router();


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  socialCallback
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  socialCallback
);

router.get(
  "/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);
router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    session: false,
    failureRedirect: "/login",
  }),
  socialCallback
);


router.get("/me", protect, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logout);


router.get("/csrf-token", generateCsrfToken);

export default router;
