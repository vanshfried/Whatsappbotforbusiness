import { useEffect, useState } from "react";
import styles from "./styles/CampaignDetail.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../API/API"; // adjust path if needed
export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await apiFetch(`/bulk/${id}`);
        setCampaign(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCampaign();
  }, [id, API]);

  if (error) {
    return <div className={styles.page}>❌ {error}</div>;
  }

  if (!campaign) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.back} onClick={() => navigate(-1)}>
          ←
        </span>
        <div>
          <div className={styles.title}>{campaign.name}</div>
          <div className={styles.subtitle}>
            {campaign.results.length} recipients
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* TEMPLATE */}
        <div className={styles.field}>
          <label>Template</label>
          <div className={styles.templatePreview}>{campaign.template}</div>
        </div>

        {/* RESULTS */}
        <div className={styles.resultsTable}>
          {campaign.results.map((r) => (
            <div key={r.id} className={styles.resultRow}>
              <div className={`${styles.col} ${styles.number}`}>
                {r.phone_number}
              </div>

              <div className={styles.col}>
                <small>Status</small>
                {r.status}
              </div>

              <div className={styles.col}>
                <small>Sent</small>
                {r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : "-"}
              </div>

              <div className={styles.col}>
                <small>Delivered</small>
                {r.delivered_at
                  ? new Date(r.delivered_at).toLocaleTimeString()
                  : "-"}
              </div>

              <div className={styles.col}>
                <small>Read</small>
                {r.read_at ? new Date(r.read_at).toLocaleTimeString() : "-"}
              </div>

              <div className={`${styles.col} ${styles.reply}`}>
                <small>First Reply</small>
                {r.first_reply_text ? (
                  <>
                    <div>{r.first_reply_text}</div>
                    <span className={styles.replyTime}>
                      {new Date(r.first_reply_time).toLocaleTimeString()}
                    </span>
                  </>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
