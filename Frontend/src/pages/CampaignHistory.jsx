import { useEffect, useState } from "react";
import styles from "./styles/CampaignHistory.module.css";

export default function CampaignHistory({ onOpen }) {
  const [campaigns, setCampaigns] = useState([]);
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${API}/bulk/history`)
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []));
  }, [API]);

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Campaigns</div>
          <div className={styles.subtitle}>
            {campaigns.length} total
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className={styles.content}>
        {campaigns.map((c) => (
          <div
            key={c.id}
            className={styles.card}
            onClick={() => onOpen(c.id)}
          >
            <div className={styles.row}>
              <strong>{c.name}</strong>
              <span className={styles.status}>{c.status}</span>
            </div>

            <div className={`${styles.row} ${styles.small}`}>
              <span>{c.stats.sent} sent</span>
              <span>{c.stats.deliveryRate}% delivered</span>
              <span>{c.stats.readRate}% read</span>
            </div>

            <div className={`${styles.row} ${styles.small}`}>
              <span>{c.stats.replies} replies</span>
              <span>
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}