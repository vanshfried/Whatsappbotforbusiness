import { useState } from "react";
import "./bulkMessage.css";

export default function BulkMessage() {
  const [numbers, setNumbers] = useState("");
  const [template, setTemplate] = useState("hello_world");
  const [name, setName] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API = import.meta.env.VITE_BACKEND_URL;

  const normalizeNumbers = (input) => {
    return input
      .split(/[\n, ,]+/)
      .map((n) => n.replace(/\D/g, ""))
      .filter((n) => n.length >= 10);
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNumbers((prev) => prev + "\n" + event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    setLoading(true);
    setMessage("");

    await fetch(`${API}/bulk/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers, template, name }),
    });

    setLoading(false);
    setMessage("Sent ✅");
  };

  const handleSchedule = async () => {
    if (!scheduleAt) return alert("Pick schedule time");

    setLoading(true);
    setMessage("");

    await fetch(`${API}/bulk/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers, template, name, scheduleAt }),
    });

    setLoading(false);
    setMessage("Scheduled ⏰");
  };

  const parsed = normalizeNumbers(numbers);

  return (
    <div className="wa-page">

      {/* HEADER */}
      <div className="wa-header">
        <span>←</span>
        <div>
          <div className="title">New Broadcast</div>
          <div className="subtitle">{parsed.length} recipients</div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wa-content">

        <div className="wa-field">
          <label>Recipients</label>
          <textarea
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder="Paste numbers..."
          />
          <div className="wa-meta">
            <span>{parsed.length} valid</span>
            <label className="csv">
              + CSV
              <input type="file" accept=".csv" onChange={handleCSV} hidden />
            </label>
          </div>
        </div>

        <div className="wa-field">
          <label>Template</label>
          <input
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>

        <div className="wa-field">
          <label>Campaign</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="wa-field">
          <label>Schedule</label>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
        </div>

        {message && <div className="wa-success">{message}</div>}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="wa-footer">
        <button onClick={handleSchedule}>Schedule</button>
        <button className="primary" onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

    </div>
  );
}