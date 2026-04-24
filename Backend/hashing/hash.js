import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config();

const PEPPER = process.env.PEPPER;

// hash password
export async function hashPassword(password) {
  return await argon2.hash(password + PEPPER, {
    type: argon2.argon2id, // 🔥 best variant
    memoryCost: 2 ** 16,   // 64 MB (strong)
    timeCost: 3,           // iterations
    parallelism: 1,
  });
}

// verify password
export async function verifyPassword(password, hash) {
  return await argon2.verify(hash, password + PEPPER);
}