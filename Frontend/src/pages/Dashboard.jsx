import { Link } from "react-router-dom";
import styles from "./styles/Dashboard.module.css";

export default function Dashboard({ role }) {
  return (
    <div className={styles.content}>
      <div className={styles.grid}>
        <Link to="/bulk-message" className={styles.card}>
          <div className={styles.icon}>📩</div>
          <h3>Bulk Messaging</h3>
          <p>Send messages to multiple users instantly</p>
        </Link>

        <Link to="/campaign-history" className={styles.card}>
          <div className={styles.icon}>📊</div>
          <h3>Campaign History</h3>
          <p>Track performance and delivery stats</p>
        </Link>

        {(role === "admin" || role === "superadmin") && (
          <Link to="/create-user" className={styles.card}>
            <div className={styles.icon}>👤</div>
            <h3>Create User</h3>
            <p>Manage your team access</p>
          </Link>
        )}
      </div>
    </div>
  );
}