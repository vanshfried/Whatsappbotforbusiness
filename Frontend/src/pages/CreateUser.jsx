import { useState } from "react";
import { apiFetch } from "../../API/api";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("support");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await apiFetch("/createuser", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });

      setMessage(res.message);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleCreate} style={styles.card}>
        <h2>Create User</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="support">Support</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Create</button>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "50px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
  },
};