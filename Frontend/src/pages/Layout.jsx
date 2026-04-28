import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from "./styles/Layout.module.css";

export default function Layout({ role, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <h2 className={styles.logo}>WhatsApp Panel</h2>

        {/* DESKTOP NAV */}
        <nav className={styles.nav}>
          <Link className={isActive("/bulk-message") ? styles.active : ""} to="/bulk-message">
            Bulk
          </Link>

          <Link className={isActive("/campaign-history") ? styles.active : ""} to="/campaign-history">
            Campaigns
          </Link>

          {(role === "admin" || role === "superadmin") && (
            <Link className={isActive("/create-user") ? styles.active : ""} to="/create-user">
              Users
            </Link>
          )}
        </nav>

        {/* RIGHT */}
        <div className={styles.right}>
          <span className={styles.role}>{role}</span>

          <button onClick={onLogout} className={styles.logout}>
            Logout
          </button>

          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/bulk-message">Bulk</Link>
          <Link to="/campaign-history">Campaigns</Link>

          {(role === "admin" || role === "superadmin") && (
            <Link to="/create-user">Users</Link>
          )}

          <button onClick={onLogout}>Logout</button>
        </div>
      )}

      {/* PAGE CONTENT */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}