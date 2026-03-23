import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", tag: "Overview" },
  { to: "/employees", label: "Employees", tag: "People" },
  { to: "/documents", label: "Documents", tag: "Policy" },
  { to: "/requests", label: "Requests", tag: "Workflow" },
  { to: "/admin", label: "Admin", tag: "Access" },
  { to: "/profile", label: "Profile", tag: "Account" },
];

function AppLayout() {
  const location = useLocation();
  const { user, isAdmin, signIn, signOutUser, authBusy } = useAuth();
  const visibleNavItems = navItems.filter((item) =>
    item.to === "/admin" ? isAdmin : true,
  );

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <p className="brand-kicker">Northstar Fintech</p>
          <h2>People Control</h2>
          <p className="brand-copy">
            Unified HR workspace for a large fintech company: people,
            documents, requests, and access governance.
          </p>
        </div>

        <div className="sidebar-signal">
          <span>Enterprise status</span>
          <strong>All systems aligned</strong>
          <p>Core HR and compliance workflows are running in one control layer.</p>
        </div>

        <nav className="app-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "app-link active" : "app-link"
              }
            >
              <div>
                <span>{item.label}</span>
                <small>{item.tag}</small>
              </div>
              <em>{item.label.slice(0, 2).toUpperCase()}</em>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Access layer</p>
          <strong>{isAdmin ? "Admin profile" : "Employee profile"}</strong>
          <span>{user?.email ?? "Not signed in"}</span>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="header-brand">
            <div className="brand-logo" aria-hidden="true">
              <span className="dot dot-a" />
              <span className="dot dot-b" />
              <span className="dot dot-c" />
            </div>
            <div>
              <p className="header-badge">Enterprise HR Platform</p>
              <h1>Northstar Fintech Workforce Hub</h1>
              <p>
                {location.pathname === "/dashboard"
                  ? "Strategic view of headcount, requests, and workforce load."
                  : "Operational interface for HR, People Ops, and internal services."}
              </p>
            </div>
          </div>

          <div className="header-user">
            <div className="user-chip">
              <strong>{user?.displayName ?? "Northstar User"}</strong>
              <span>{user?.email ?? "Not signed in"}</span>
            </div>
            {user ? (
              <button className="btn solid" onClick={signOutUser}>
                Sign out
              </button>
            ) : (
              <button className="btn solid" onClick={signIn} disabled={authBusy}>
                {authBusy ? "Signing in..." : "Sign in"}
              </button>
            )}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;