"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  Home,
  Users,
  UserCheck,
  Coins,
  Handshake,
  PiggyBank,
  HandCoins,
  UserX,
  Building,
  Landmark,
  Percent,
  ArrowLeftRight,
  Cpu,
  UserCog,
  Scroll,
  BarChart2,
  Sliders,
  Tag,
  ClipboardList,
  MessageSquare,
  LogOut,
} from "lucide-react";
import styles from "./sidebar.module.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuGroups = [
    {
      label: "Customers",
      items: [
        { label: "Users", icon: <Users size={16} />, href: "/users" },
        { label: "Guarantors", icon: <Users size={16} />, href: "#" },
        { label: "Loans", icon: <Coins size={16} />, href: "#" },
        { label: "Decision Models", icon: <Handshake size={16} />, href: "#" },
        { label: "Savings", icon: <PiggyBank size={16} />, href: "#" },
        { label: "Loan Requests", icon: <HandCoins size={16} />, href: "#" },
        { label: "Whitelist", icon: <UserCheck size={16} />, href: "#" },
        { label: "Karma", icon: <UserX size={16} />, href: "#" },
      ],
    },
    {
      label: "Businesses",
      items: [
        { label: "Organization", icon: <Briefcase size={16} />, href: "#" },
        { label: "Loan Products", icon: <HandCoins size={16} />, href: "#" },
        { label: "Savings Products", icon: <Landmark size={16} />, href: "#" },
        { label: "Fees and Charges", icon: <Coins size={16} />, href: "#" },
        { label: "Transactions", icon: <ArrowLeftRight size={16} />, href: "#" },
        { label: "Services", icon: <Cpu size={16} />, href: "#" },
        { label: "Service Account", icon: <UserCog size={16} />, href: "#" },
        { label: "Settlements", icon: <Scroll size={16} />, href: "#" },
        { label: "Reports", icon: <BarChart2 size={16} />, href: "#" },
      ],
    },
    {
      label: "Settings",
      items: [
        { label: "Preferences", icon: <Sliders size={16} />, href: "#" },
        { label: "Fees and Pricing", icon: <Tag size={16} />, href: "#" },
        { label: "Audit Logs", icon: <ClipboardList size={16} />, href: "#" },
        { label: "Systems Messages", icon: <MessageSquare size={16} />, href: "#" },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/users") return pathname.startsWith("/users");
    return pathname === href;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Org Switcher */}
        <div className={styles.orgSwitcher}>
          <Briefcase size={16} className={styles.briefcase} />
          <span>Switch Organization</span>
          <ChevronDown size={12} className={styles.chevron} />
        </div>

        {/* Dashboard Link -> Redirect to /users since no dashboard page */}
        <div className={styles.navGroup}>
          <Link
            href="/users"
            onClick={onClose}
            className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            <Home size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Navigation Groups */}
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={styles.navGroup}>
            <h3 className={styles.groupLabel}>{group.label}</h3>
            {group.items.map((item, itemIdx) => (
              <Link
                key={itemIdx}
                href={item.href}
                onClick={onClose}
                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}

        <div className={styles.divider} />

        {/* Signout Button */}
        <div className={styles.navGroup}>
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
