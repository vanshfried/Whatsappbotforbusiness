import { Link } from "react-router-dom";
import styles from "./styles/Dashboard.module.css";

export default function Dashboard({ role, onLogout }) {
  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h3 className={styles.logo}>Panel</h3>

        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>Home</Link>

          {(role === "admin" || role === "superadmin") && (
            <Link to="/create-user" className={styles.link}>
              Create User
            </Link>
          )}
        </nav>

        <button className={styles.logout} onClick={onLogout}>
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <h2>Welcome 🎉</h2>
        <p>Your role: {role}</p>
      </main>
    </div>
  );
}