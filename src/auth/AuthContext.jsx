import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { AuthContext } from "./auth-context.js";
import { adminEmails, isAdminEmail } from "./admin.js";

function mapAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/popup-closed-by-user") return "Login popup was closed.";
  if (code === "auth/popup-blocked") return "Popup blocked. Browser redirect login started.";
  if (code === "auth/cancelled-popup-request") {
    return "Another sign-in attempt is already in progress.";
  }
  if (code === "auth/operation-not-supported-in-this-environment") {
    return "Popup login is unavailable here. Redirect login started.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Auth settings.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Google provider is disabled in Firebase Authentication.";
  }
  return err?.message ?? "Sign in failed";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    if (authBusy) return;

    setError("");
    setAuthBusy(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = err?.code || "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        setError("Popup blocked. Redirecting to Google sign in...");
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setError(mapAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  }, [authBusy]);

  const signOutUser = useCallback(async () => {
    setError("");
    try {
      await signOut(auth);
    } catch (err) {
      setError(err?.message ?? "Sign out failed");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin: isAdminEmail(user?.email),
      adminEmails,
      loading,
      authBusy,
      error,
      signIn,
      signOutUser,
    }),
    [user, loading, authBusy, error, signIn, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
