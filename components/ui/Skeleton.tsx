import React from "react";
import styles from "./skeleton.module.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width,
  height,
  circle,
  className = "",
  style,
}: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : "100%",
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : "16px",
    borderRadius: circle ? "50%" : undefined,
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={customStyle}
    />
  );
}
