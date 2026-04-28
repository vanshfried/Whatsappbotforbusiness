// backend/Middleware/authrequirements.js
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export async function requireAuth(req, res, next) {
  const token = req.cookies.token;

  // 🍪 1. cookie check
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 🔑 2. jwt verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🗄️ 3. db check
    const result = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // 👤 4. attach fresh user
    req.user = result.rows[0];

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// 🔐 2. Role-based access
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
