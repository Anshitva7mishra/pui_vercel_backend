import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";

export const generateCsrfToken = (_req, res) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ csrfToken });
};

export const verifyCsrf = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
};
