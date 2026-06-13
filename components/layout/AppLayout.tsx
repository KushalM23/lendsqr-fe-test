"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import styles from "./appLayout.module.scss";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.mainWrapper}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.contentPage}>
          {children}
        </main>
      </div>
    </div>
  );
}
