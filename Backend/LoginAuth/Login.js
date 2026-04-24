import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { verifyPassword } from "../hashing/hash.js";

const router = express.Router();

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// 🔒 hash function for refresh token
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const FAKE_HASH =
  "$argon2id$v=19$m=65536,t=3,p=1$fakefakefake$fakefakefakefakefakefake";


// 🔐 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    const hashToCheck = user ? user.password_hash : FAKE_HASH;
    const valid = await verifyPassword(password, hashToCheck);

    if (!user || !valid) {
      if (user) {
        const attempts = (user.login_attempts || 0) + 1;
        let lockUntil = user.lock_until;

        if (attempts >= MAX_ATTEMPTS) {
          lockUntil = new Date(Date.now() + LOCK_TIME);
        }

        await pool.query(
          `UPDATE users SET login_attempts=$1, lock_until=$2 WHERE id=$3`,
          [attempts, lockUntil, user.id]
        );
      }

      await new Promise((r) => setTimeout(r, 200));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(403).json({ error: "Account locked" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "Account disabled" });
    }

    await pool.query(
      `UPDATE users SET login_attempts=0, lock_until=NULL WHERE id=$1`,
      [user.id]
    );

    // 🔐 ACCESS TOKEN
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // 🔁 REFRESH TOKEN (raw + hashed)
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const hashedToken = hashToken(refreshToken);

    await pool.query(
      `UPDATE users SET refresh_token=$1 WHERE id=$2`,
      [hashedToken, user.id]
    );

    // 🍪 cookies
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // allow in dev
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false, // allow in dev
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    return res.json({
      message: "Login successful",
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


// 🔁 REFRESH ROUTE
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  const hashedToken = hashToken(refreshToken);

  const result = await pool.query(
    "SELECT * FROM users WHERE refresh_token=$1",
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  const user = result.rows[0];

  // 🔄 ROTATE refresh token (important)
  const newRefreshToken = crypto.randomBytes(40).toString("hex");
  const newHashed = hashToken(newRefreshToken);

  await pool.query(
    `UPDATE users SET refresh_token=$1 WHERE id=$2`,
    [newHashed, user.id]
  );

  // 🔐 new access token
  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // 🍪 update cookies
  res.cookie("token", newAccessToken, {
    httpOnly: true,
    secure: false, // allow in dev
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: false, // allow in dev
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY,
  });

  res.json({ message: "Token refreshed" });
});


// 🔓 LOGOUT
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);

    await pool.query(
      `UPDATE users SET refresh_token=NULL WHERE refresh_token=$1`,
      [hashedToken]
    );
  }

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // allow clearing in dev
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // allow clearing in dev
  });

  res.json({ message: "Logged out" });
});

export default router;