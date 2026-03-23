import { useState } from "react";
import { MetricCard, SectionHead, StatusPill } from "../components/UI.jsx";
import { adminUsers } from "../data/mock.js";
import { useAuth } from "../auth/useAuth.jsx";
import { seedWorkspaceData } from "../firebase/seedWorkspace.js";

const tabs = ["Users", "Roles", "Integrations"];

function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState(adminUsers);
  const [seedStatus, setSeedStatus] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        return {
          ...entry,
          status: entry.status === "active" ? "limited" : "active",
        };
      }),
    );
  };

  const seedFirebase = async () => {
    setIsSeeding(true);
    setSeedStatus("");

    try {
      await seedWorkspaceData(user);
      setSeedStatus("Firestore base collections were seeded successfully.");
    } catch (error) {
      setSeedStatus(error.message ?? "Failed to seed Firestore.");
    } finally {
      setIsSeeding(false);
    }
  };

  const adminStats = [
    {
      title: "Admin profiles",
      value: users.length,
      delta: "Access control for internal modules",
      tone: "ink",
      eyebrow: "Users",
    },
    {
      title: "Active",
      value: users.filter((entry) => entry.status === "active").length,
      delta: "Profiles with full access",
      tone: "sea",
      eyebrow: "Live",
    },
    {
      title: "Integrations",
      value: "Firebase",
      delta: "Auth and Firestore connected to the app",
      tone: "sun",
      eyebrow: "Stack",
    },
  ];

  return (
    <section className="page-wrap">
      <SectionHead
        title="Administrative console"
        subtitle="Access, roles, and internal integration roadmap"
      />

      <div className="metric-grid compact">
        {adminStats.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="chip-row">
        {tabs.map((item) => (
          <button
            key={item}
            className={item === tab ? "chip active" : "chip"}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Users" && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.name}</td>
                  <td>{entry.email}</td>
                  <td>{entry.role}</td>
                  <td>
                    <StatusPill value={entry.status} />
                  </td>
                  <td>
                    <button className="btn soft" onClick={() => toggleStatus(entry.id)}>
                      Toggle access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Roles" && (
        <article className="panel">
          <div className="profile-lines">
            <div>
              <span>super_admin</span>
              <strong>Full platform and integration control</strong>
            </div>
            <div>
              <span>hr_admin</span>
              <strong>Requests, employees, documents, and HR workflows</strong>
            </div>
            <div>
              <span>manager</span>
              <strong>Team visibility and first-line review for employee requests</strong>
            </div>
            <div>
              <span>finance_view</span>
              <strong>Read-only access for payroll-adjacent modules</strong>
            </div>
          </div>
        </article>
      )}

      {tab === "Integrations" && (
        <article className="panel accent">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Firebase foundation</p>
              <h3>Seed and initialize workspace data</h3>
            </div>
          </div>
          <ol className="mini-steps">
            <li>Seed departments, roles, request types, workflows, employees, and documents.</li>
            <li>Store new employee cards inside the `employees` collection.</li>
            <li>Store all submitted requests inside the `requests` collection.</li>
            <li>Write request submission actions into `action_logs` for future analytics.</li>
          </ol>
          <div className="panel-actions">
            <button className="btn solid" onClick={seedFirebase} disabled={isSeeding}>
              {isSeeding ? "Seeding Firebase..." : "Seed Firestore base"}
            </button>
            {seedStatus ? <p>{seedStatus}</p> : null}
          </div>
        </article>
      )}
    </section>
  );
}

export default AdminPage;
