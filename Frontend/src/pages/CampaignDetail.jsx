import { useEffect, useState } from "react";
import "./bulkMessage.css";

export default function CampaignDetail({ id, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${API}/bulk/${id}`)
      .then((res) => res.json())
      .then(setCampaign);
  }, [id, API]);

  if (!campaign) return <div className="wa-page">Loading...</div>;

  return (
    <div className="wa-page">

      {/* HEADER */}
      <div className="wa-header">
        <span onClick={onBack}>←</span>
        <div>
          <div className="title">{campaign.name}</div>
          <div className="subtitle">
            {campaign.results.length} recipients
          </div>
        </div>
      </div>

      {/* TEMPLATE PREVIEW */}
      <div className="wa-content">
        <div className="wa-field">
          <label>Template</label>
          <div className="template-preview">
            {campaign.template}
          </div>
        </div>

        {/* TABLE */}
        <div className="results-table">

          {campaign.results.map((r, i) => (
            <div key={i} className="result-row">

              <div className="col number">{r.number}</div>

              <div className="col">
                <small>Sent</small>
                {r.sentAt && new Date(r.sentAt).toLocaleTimeString()}
              </div>

              <div className="col">
                <small>Delivered</small>
                {r.deliveredAt
                  ? new Date(r.deliveredAt).toLocaleTimeString()
                  : "-"}
              </div>

              <div className="col">
                <small>Read</small>
                {r.readAt
                  ? new Date(r.readAt).toLocaleTimeString()
                  : "-"}
              </div>

              <div className="col reply">
                <small>First Reply</small>
                {r.firstReply ? r.firstReply.text : "-"}
              </div>

              <div className="col">
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