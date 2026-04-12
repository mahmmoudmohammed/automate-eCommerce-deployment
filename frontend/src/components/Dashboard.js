/**
 * Dashboard.js
 * Protected dashboard — uses the reusable <LogoutButton />.
 */
import React from "react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Dashboard = () => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        {/* Avatar */}
        <div className="dashboard-avatar" aria-hidden="true">
          {initials}
        </div>

        {/* User info */}
        <h2 className="dashboard-greeting">Hey, {user?.name}! 👋</h2>
        <p className="dashboard-email">{user?.email}</p>
        <p className="dashboard-meta">Member since {memberSince}</p>

        {/* Info pills */}
        <div className="info-pills">
          <span className="pill pill--green">✓ Verified</span>
          <span className="pill pill--blue">Active</span>
        </div>

        {/* Reusable logout button */}
        <LogoutButton label="Sign Out" className="dashboard-logout" />
      </div>
    </div>
  );
};

export default Dashboard;
