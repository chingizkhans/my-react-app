const fallbackAdmins = ["paradoxakka@gmail.com"];

const raw = import.meta.env.VITE_ADMIN_EMAILS;

export const adminEmails = (raw ? raw.split(",") : fallbackAdmins)
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
}
