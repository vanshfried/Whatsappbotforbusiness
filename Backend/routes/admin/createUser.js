import express from "express";
import { pool } from "../../db.js";
import { hashPassword } from "../../hashing/hash.js"; // ✅ use your argon2
import { requireAuth, requireRole } from "../../middleware/authrequirements.js";
import { isValidEmail, isStrongPassword } from "../../utils/validators.js";

const router = express.Router();

// 👤 CREATE USER
router.post(
  "/",
  requireAuth,
  requireRole("superadmin", "admin"),
  async (req, res) => {
    const { email, password, role } = req.body;
    const creator = req.user;

    try {
      // 🔍 VALIDATION
      if (!email || !password || !role) {
        return res.status(400).json({ error: "All fields required" });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (!isStrongPassword(password, email)) {
        return res.status(400).json({
          error:
            "Password must be 8+ chars with uppercase, lowercase, number, symbol and not same as email",
        });
      }

      // 🔐 ROLE RULES
      if (creator.role === "admin" && role !== "support") {
        return res.status(403).json({
          error: "Admin can only create support users",
        });
      }

      if (
        creator.role === "superadmin" &&
        !["admin", "support"].includes(role)
      ) {
        return res.status(403).json({
          error: "Invalid role",
        });
      }

      // ❌ prevent duplicate email
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // 🔐 HASH PASSWORD (argon2 + pepper from your system)
      const hashedPassword = await hashPassword(password);

      // 💾 INSERT USER
      await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, $3, true)`,
        [email, hashedPassword, role]
      );

      res.json({ message: "User created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;