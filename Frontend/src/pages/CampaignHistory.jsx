import { useEffect, useState, useCallback } from "react";
import styles from "./styles/CampaignHistory.module.css";
import { useNavigate } from "react-router-dom";
export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  // ✅ memoized function (fixes dependency issue)
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/bulk/history`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setCampaigns(data.campaigns || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };

    run();

    const interval = setInterval(run, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusClass = (status) => {
    if (status === "completed") return styles.completed;
    if (status === "running") return styles.running;
    if (status === "scheduled") return styles.scheduled;
    return "";
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Campaigns</div>
          <div className={styles.subtitle}>{campaigns.length} total</div>
        </div>
      </div>

      {loading && <div className={styles.info}>Loading...</div>}
      {error && <div className={styles.error}>❌ {error}</div>}

      {!loading && campaigns.length === 0 && (
        <div className={styles.info}>No campaigns yet</div>
      )}

      <div className={styles.content}>
        {campaigns.map((c) => (
          <div key={c.id} className={styles.card} onClick={() => navigate(`/campaign/${c.id}`)}>
            <div className={styles.row}>
              <strong>{c.name}</strong>
              <span className={`${styles.status} ${getStatusClass(c.status)}`}>
                {c.status}
              </span>
            </div>

            <div className={`${styles.row} ${styles.small}`}>
              <span>{c.stats.sent} sent</span>
              <span>{c.stats.deliveryRate}% delivered</span>
              <span>{c.stats.readRate}% read</span>
            </div>

            <div className={`${styles.row} ${styles.small}`}>
              <span>{c.stats.replies} replies</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
