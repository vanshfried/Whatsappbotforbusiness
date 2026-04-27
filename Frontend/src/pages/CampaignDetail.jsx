import { useEffect, useState } from "react";
import styles from "./styles/CampaignDetail.module.css";

export default function CampaignDetail({ id, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${API}/bulk/${id}`)
      .then((res) => res.json())
      .then(setCampaign);
  }, [id, API]);

  if (!campaign) return <div className={styles.page}>Loading...</div>;

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.back} onClick={onBack}>←</span>
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
          <div className={styles.templatePreview}>
            {campaign.template}
          </div>
        </div>

        {/* RESULTS */}
        <div className={styles.resultsTable}>
          {campaign.results.map((r, i) => (
            <div key={i} className={styles.resultRow}>
              
              <div className={`${styles.col} ${styles.number}`}>
                {r.number}
              </div>

              <div className={styles.col}>
                <small>Sent</small>
                {r.sentAt && new Date(r.sentAt).toLocaleTimeString()}
              </div>

              <div className={styles.col}>
                <small>Delivered</small>
                {r.deliveredAt
                  ? new Date(r.deliveredAt).toLocaleTimeString()
                  : "-"}
              </div>

              <div className={styles.col}>
                <small>Read</small>
                {r.readAt
                  ? new Date(r.readAt).toLocaleTimeString()
                  : "-"}
              </div>

              <div className={`${styles.col} ${styles.reply}`}>
                <small>First Reply</small>
                {r.firstReply ? r.firstReply.text : "-"}
              </div>

              <div className={styles.col}>
                <small>Replies</small>
                {r.replyCount || 0}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}