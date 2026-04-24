import { apiFetch } from "./api";

export async function loginUser(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutUser() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

export async function refreshToken() {
  return apiFetch("/auth/refresh", {
    method: "POST",
  });
}