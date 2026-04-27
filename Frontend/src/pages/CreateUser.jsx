import { useState } from "react";
import { apiFetch } from "../../API/api";
import styles from "./styles/CreateUser.module.css";

export default function CreateUser({ currentRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("support");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedRole = currentRole?.toLowerCase();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await apiFetch("/createuser", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });

      setMessage(res.message || "User created ✅");
      setEmail("");
      setPassword("");
      setRole("support");
    } catch (err) {
      setError(
        err?.response?.error ||
        err?.error ||
        err?.message ||
        "Failed to create user ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleCreate} className={styles.card}>
        <h2 className={styles.title}>Create User</h2>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="support">Support</option>

            {normalizedRole === "superadmin" && (
              <option value="admin">Admin</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className={styles.primary}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
}