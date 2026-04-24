import { Link } from "react-router-dom";

export default function Dashboard({ role, onLogout }) {
  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3>Panel</h3>

        <Link to="/">Home</Link>

        {(role === "admin" || role === "superadmin") && (
          <Link to="/create-user">Create User</Link>
        )}

        <button onClick={onLogout}>Logout</button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2>Welcome 🎉</h2>
        <p>Your role: {role}</p>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    padding: "20px",
    background: "#111",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  main: {
    padding: "20px",
    flex: 1,
  },
};