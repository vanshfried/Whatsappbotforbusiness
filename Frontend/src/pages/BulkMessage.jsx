import { useState } from "react";
import styles from "./styles/bulkMessage.module.css";

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
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.back}>←</span>
        <div>
          <div className={styles.title}>New Broadcast</div>
          <div className={styles.subtitle}>
            {parsed.length} recipients
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        <div className={styles.field}>
          <label>Recipients</label>
          <textarea
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder="Paste numbers..."
          />
          <div className={styles.meta}>
            <span>{parsed.length} valid</span>
            <label className={styles.csv}>
              + CSV
              <input type="file" accept=".csv" onChange={handleCSV} hidden />
            </label>
          </div>
        </div>

        <div className={styles.field}>
          <label>Template</label>
          <input
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Campaign</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Schedule</label>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
        </div>

        {message && <div className={styles.success}>{message}</div>}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button onClick={handleSchedule}>Schedule</button>
        <button
          className={styles.primary}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}