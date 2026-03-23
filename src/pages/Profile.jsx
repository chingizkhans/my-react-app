import { useState } from "react";
import { MetricCard, SectionHead } from "../components/UI.jsx";
import { useAuth } from "../auth/useAuth.jsx";

function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState(true);
  const [digest, setDigest] = useState(false);

  const profileStats = [
    {
      title: "Access level",
      value: isAdmin ? "Admin" : "Employee",
      delta: isAdmin ? "Access to the management console" : "Standard internal access",
      tone: "sea",
      eyebrow: "Access",
    },
    {
      title: "Session",
      value: user ? "Active" : "None",
      delta: user ? "Profile connected to Firebase Auth" : "Sign-in required",
      tone: "ink",
      eyebrow: "Identity",
    },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="Profile and settings"
        subtitle="Personal workspace preferences and notification controls"
      />

      <div className="metric-grid compact">
        {profileStats.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="panel-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Account</p>
              <h3>Account details</h3>
            </div>
          </div>
          <div className="profile-lines">
            <div>
              <span>Name</span>
              <strong>{user?.displayName ?? "Northstar User"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email ?? "No active session"}</strong>
            </div>
            <div>
              <span>Permissions</span>
              <strong>{isAdmin ? "HR + Admin Console" : "Internal HR"}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Notifications</p>
              <h3>Notification preferences</h3>
            </div>
          </div>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={alerts}
              onChange={(event) => setAlerts(event.target.checked)}
            />
            Instant alerts for priority requests
          </label>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={digest}
              onChange={(event) => setDigest(event.target.checked)}
            />
            Daily digest by email
          </label>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;