import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as DiscordStrategy } from "passport-discord";
import User from "../models/User.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

import { sendWelcomeEmail } from "../services/emailService.js";

dotenv.config();

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:5000";

const handleSocialAuth = async (
  provider,
  profileId,
  email,
  name,
  avatar,
  done
) => {
  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.providerId) {
        user.provider = provider;
        user.providerId = profileId;
        user.avatar = avatar;
        await user.save();
      }
      // 🚪 RETURN EARLY - Do not run the email code below
      return done(null, user);
    }

    // 3. NEW USER LOGIC (Run this only for first-timers)
    user = await User.create({
      name,
      email,
      avatar,
      provider,
      providerId: profileId,
    });

    // ✅ SEND WELCOME EMAIL (Runs ONLY for new users)
    try {
      logger.info(`New user detected! Sending welcome email to ${email}...`);
      await sendWelcomeEmail(email, name);
      logger.info(`Welcome email sent.`);
    } catch (emailError) {
      logger.error(`Failed to send welcome email: ${emailError.message}`);
    }

    return done(null, user);
  } catch (err) {
    logger.error(`${provider} Auth Error: ${err.message}`);
    return done(err, null);
  }
};

// --- STRATEGIES ---

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      await handleSocialAuth(
        "google",
        profile.id,
        profile.emails[0].value,
        profile.displayName,
        profile.photos[0].value,
        done
      );
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const email =
        profile.emails && profile.emails[0]
          ? profile.emails[0].value
          : `${profile.username}@github.com`;

      await handleSocialAuth(
        "github",
        profile.id,
        email,
        profile.displayName || profile.username,
        profile.photos[0].value,
        done
      );
    }
  )
);

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/discord/callback`,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      await handleSocialAuth(
        "discord",
        profile.id,
        profile.email,
        profile.global_name || profile.username,
        `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        done
      );
    }
  )
);
