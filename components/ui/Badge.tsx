import React from "react";
import styles from "./badge.module.scss";

type BadgeStatus = "active" | "inactive" | "pending" | "blacklisted";

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className = "" }: BadgeProps) {
  const normalizedStatus = status.toLowerCase() as BadgeStatus;

  let statusClass = styles.inactive; // fallback
  if (normalizedStatus === "active") statusClass = styles.active;
  else if (normalizedStatus === "pending") statusClass = styles.pending;
  else if (normalizedStatus === "blacklisted") statusClass = styles.blacklisted;

  return (
    <span className={`${styles.badge} ${statusClass} ${className}`}>
      {normalizedStatus}
    </span>
  );
}
