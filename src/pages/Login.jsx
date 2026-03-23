import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";

function LoginPage() {
  const { user, signIn, error, loading, authBusy } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="login-page">
      <article className="login-card">
        <p className="login-kicker">Northstar Fintech</p>
        <h1>Sign in to the internal HR workspace</h1>
        <p>
          Use your corporate Google account to access People Hub,
          policy documents, and approval workflows.
        </p>
        <div className="hero-tags login-tags">
          <span>People Ops</span>
          <span>Documents</span>
          <span>Access Control</span>
        </div>
        <button className="btn solid login-button" onClick={signIn} disabled={authBusy}>
          {authBusy ? "Signing in..." : "Sign in with Google"}
        </button>
        {error ? <p className="auth-error">{error}</p> : null}
      </article>
    </section>
  );
}

export default LoginPage;