export default function Dashboard({ role, onLogout }) {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome 🎉</h2>
      <p>Your role: {role}</p>

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}