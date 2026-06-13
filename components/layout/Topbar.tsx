"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import styles from "./topbar.module.scss";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          className={styles.hamburger}
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={24} />
        </button>
        <Link href="/users" className={styles.logoWrapper}>
          <Image
            src="/logo.svg"
            alt="Lendsqr Logo"
            width={145}
            height={30}
            priority
          />
        </Link>
      </div>

      <div className={styles.searchSection}>
        <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Search for anything"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <Search size={14} />
          </button>
        </form>
      </div>

      <div className={styles.rightSection}>
        <Link href="#" className={styles.docsLink}>
          Docs
        </Link>

        <button className={styles.notificationBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div
          className={styles.profileWrapper}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          ref={dropdownRef}
        >
          <Image
            src="/image 4.png"
            alt="User Avatar"
            width={40}
            height={40}
            className={styles.avatar}
          />
          <span className={styles.userName}>Adedeji</span>
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${dropdownOpen ? styles.open : ""}`}
          />

          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
