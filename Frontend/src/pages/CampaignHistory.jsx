import { useEffect, useState } from "react";
import "./bulkMessage.css";

export default function CampaignHistory({ onOpen }) {
  const [campaigns, setCampaigns] = useState([]);
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${API}/bulk/history`)
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []));
  }, [API]);

  return (
    <div className="wa-page">

      {/* HEADER */}
      <div className="wa-header">
        <div>
          <div className="title">Campaigns</div>
          <div className="subtitle">{campaigns.length} total</div>
        </div>
      </div>

      {/* LIST */}
      <div className="wa-content">

        {campaigns.map((c) => (
          <div
            key={c.id}
            className="campaign-card"
            onClick={() => onOpen(c.id)}
          >
            <div className="row">
              <strong>{c.name}</strong>
              <span className="status">{c.status}</span>
            </div>

            <div className="row small">
              <span>{c.stats.sent} sent</span>
              <span>{c.stats.deliveryRate}% delivered</span>
              <span>{c.stats.readRate}% read</span>
            </div>

            <div className="row small">
              <span>{c.stats.replies} replies</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}