// lib/auth-flow.ts - Authentication flow helpers

export const handleAuthSuccess = async () => {
  // Set flag to check auth status on next load
  localStorage.setItem("xleos_check_auth", "true");

  // Redirect to home or dashboard
  window.location.href = "/";
};

export const handleAuthError = (error: string) => {
  console.error("❌ Auth error:", error);
  localStorage.removeItem("xleos_check_auth");

  // Show error to user
  alert(`Authentication failed: ${error}`);
};

export const clearAuthIndicators = () => {
  localStorage.removeItem("xleos_check_auth");
};

export const shouldCheckAuth = (): boolean => {
  const hasAuthCallback = window.location.pathname.includes("/auth/callback");
  const hasStatusCheck = localStorage.getItem("xleos_check_auth") === "true";

  return hasAuthCallback || hasStatusCheck;
};
