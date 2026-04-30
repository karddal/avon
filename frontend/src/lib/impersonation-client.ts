"use client";

export function hasActiveImpersonationClientState() {
  if (typeof window === "undefined") {
    return false;
  }

  const transition = window.sessionStorage.getItem("impersonation-transition");

  return (
    transition === "impersonating" ||
    transition === "returning" ||
    window.sessionStorage.getItem("impersonation-active") === "true"
  );
}
