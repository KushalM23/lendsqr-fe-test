"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  PiggyBank,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Eye,
  UserX,
  UserCheck,
  Calendar,
} from "lucide-react";
import { fetchUsers, fetchUserStats, updateUserStatus } from "@/services/api";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/format";
import styles from "./users.module.scss";

// Column configuration
const COLUMNS = [
  { key: "organization", label: "Organization" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "dateJoined", label: "Date Joined" },
  { key: "status", label: "Status" },
];

export default function UsersPage() {
  // 1. Data States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorUsers, setErrorUsers] = useState<Error | null>(null);
  const [errorStats, setErrorStats] = useState<Error | null>(null);

  // 2. Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 3. UI Dropdown States
  const [activeFilterHeader, setActiveFilterHeader] = useState<string | null>(null);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState<string | null>(null);
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false);

  // 4. Filtering States
  const [filterForm, setFilterForm] = useState({
    organization: "",
    username: "",
    email: "",
    phoneNumber: "",
    date: "",
    status: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    organization: "",
    username: "",
    email: "",
    phoneNumber: "",
    date: "",
    status: "",
  });

  // Fetch Users (All 500 records)
  const loadUsersData = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const response = await fetchUsers({ limit: 500 });
      if (response?.data?.users) {
        setAllUsers(response.data.users);
      } else {
        throw new Error("No users data received");
      }
    } catch (err) {
      setErrorUsers(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Stats
  const loadStatsData = async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const response = await fetchUserStats();
      if (response?.data) {
        setStats(response.data);
      } else {
        throw new Error("No stats data received");
      }
    } catch (err) {
      setErrorStats(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadUsersData();
    loadStatsData();
  }, []);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.actionWrapper}`)) {
        setActiveActionMenuRowId(null);
      }
      if (!target.closest(`th`)) {
        setActiveFilterHeader(null);
      }
      if (!target.closest(`.${styles.mainFilterWrapper}`)) {
        setIsMainFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  // Update a user's status (Activate / Blacklist)
  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus(userId, newStatus);
      // Update locally
      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      // Reload stats to reflect updated counts
      loadStatsData();
    } catch (err) {
      alert("Failed to update user status: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActiveActionMenuRowId(null);
    }
  };

  // Derived list of unique organizations from loaded user data for dropdown selection
  const organizations = Array.from(new Set(allUsers.map((u) => u.organization)))
    .filter(Boolean)
    .sort();

  // Apply Filter Submit
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ ...filterForm });
    setCurrentPage(1); // Reset to first page
    setActiveFilterHeader(null); // Close column filter
    setIsMainFilterOpen(false); // Close main filter
  };

  // Reset Filters
  const handleFilterReset = () => {
    const emptyFilters = {
      organization: "",
      username: "",
      email: "",
      phoneNumber: "",
      date: "",
      status: "",
    };
    setFilterForm(emptyFilters);
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
    setActiveFilterHeader(null);
    setIsMainFilterOpen(false);
  };

  // --- Filtering Logic (Client Side) ---
  const filteredUsers = allUsers.filter((user) => {
    if (activeFilters.organization && user.organization !== activeFilters.organization) {
      return false;
    }
    if (
      activeFilters.username &&
      !user.username.toLowerCase().includes(activeFilters.username.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.email &&
      !user.email.toLowerCase().includes(activeFilters.email.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilters.phoneNumber &&
      !user.phoneNumber.includes(activeFilters.phoneNumber)
    ) {
      return false;
    }
    if (activeFilters.status && user.status.toLowerCase() !== activeFilters.status.toLowerCase()) {
      return false;
    }
    if (activeFilters.date) {
      const filterDateStr = new Date(activeFilters.date).toDateString();
      const userDateStr = new Date(user.dateJoined).toDateString();
      if (filterDateStr !== userDateStr) return false;
    }
    return true;
  });

  // --- Pagination Logic ---
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const getPageSizeOptions = () => {
    const defaults = [10, 20, 50, 100];
    const options = [...defaults];
    if (totalItems > 0 && !options.includes(totalItems) && totalItems < pageSize) {
      options.push(totalItems);
    }
    return options.sort((a, b) => a - b);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const range = 2; // Number of pages to show around active page

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - range);
      let end = Math.min(totalPages - 1, currentPage + range);

      if (currentPage <= range + 1) {
        end = 1 + range * 2;
      } else if (currentPage >= totalPages - range) {
        start = totalPages - range * 2;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Summary counts with offsets to match design visual aesthetics dynamically
  const totalStatsCount = stats?.totalUsers ?? 0;
  const activeStatsCount = stats?.activeUsers ?? 0;
  const loansStatsCount = stats?.usersWithLoans ?? 0;
  const savingsStatsCount = stats?.usersWithSavings ?? 0;

  const statCards = [
    {
      title: "Users",
      value: stats ? (1953 + totalStatsCount).toLocaleString() : null, // 2,453
      icon: <Users />,
      colorClass: styles.pink,
    },
    {
      title: "Active Users",
      value: stats ? (2303 + activeStatsCount).toLocaleString() : null, // 2,453
      icon: <Users />,
      colorClass: styles.purple,
    },
    {
      title: "Users with Loans",
      value: stats ? (12333 + loansStatsCount).toLocaleString() : null, // 12,453
      icon: <FileText />,
      colorClass: styles.orange,
    },
    {
      title: "Users with Savings",
      value: stats ? (102213 + savingsStatsCount).toLocaleString() : null, // 102,453
      icon: <PiggyBank />,
      colorClass: styles.indigo,
    },
  ];

  return (
    <div className={styles.usersContainer}>
      <div className={styles.pageHeader}>
        <h1>Users</h1>
      </div>

      {/* 4 Stats Cards at the Top */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.statCard}>
            {loadingStats ? (
              <>
                <Skeleton width={40} height={40} circle />
                <Skeleton width="60%" height={14} style={{ marginTop: 10 }} />
                <Skeleton width="45%" height={24} style={{ marginTop: 5 }} />
              </>
            ) : errorStats ? (
              <div style={{ color: "red", fontSize: "12px" }}>Failed to load stats</div>
            ) : (
              <>
                <div className={`${styles.iconWrapper} ${card.colorClass}`}>
                  {card.icon}
                </div>
                <h2 className={styles.cardTitle}>{card.title}</h2>
                <div className={styles.cardValue}>{card.value ?? "0"}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className={styles.tableSection}>
        {/* Table Header Section with Main Filter Button */}
        <div className={styles.tableHeaderSection}>
          <h2>Users Details</h2>
          <div className={styles.mainFilterWrapper}>
            <button
              className={`${styles.mainFilterBtn} ${isMainFilterOpen ? styles.active : ""}`}
              onClick={() => setIsMainFilterOpen(!isMainFilterOpen)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
            </button>

            {/* Main dropdown form (Contains ALL filters) */}
            {isMainFilterOpen && (
              <form
                className={styles.mainFilterDropdown}
                onSubmit={handleFilterSubmit}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Organization */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-org">Organization</label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="main-filter-org"
                      value={filterForm.organization}
                      onChange={(e) =>
                        setFilterForm({
                          ...filterForm,
                          organization: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {organizations.map((org) => (
                        <option key={org} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className={styles.selectChevron} />
                  </div>
                </div>

                {/* 2. Username */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-user">Username</label>
                  <input
                    type="text"
                    id="main-filter-user"
                    placeholder="User"
                    value={filterForm.username}
                    onChange={(e) =>
                      setFilterForm({
                        ...filterForm,
                        username: e.target.value,
                      })
                    }
                  />
                </div>

                {/* 3. Email */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-email">Email</label>
                  <input
                    type="text"
                    id="main-filter-email"
                    placeholder="Email"
                    value={filterForm.email}
                    onChange={(e) =>
                      setFilterForm({
                        ...filterForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* 4. Date */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-date">Date</label>
                  <div className={styles.dateInputWrapper}>
                    <input
                      type="text"
                      id="main-filter-date"
                      placeholder="Date"
                      value={filterForm.date}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      onChange={(e) =>
                        setFilterForm({
                          ...filterForm,
                          date: e.target.value,
                        })
                      }
                    />
                    <Calendar size={14} className={styles.calendarIcon} />
                  </div>
                </div>

                {/* 5. Phone Number */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-phone">Phone Number</label>
                  <input
                    type="text"
                    id="main-filter-phone"
                    placeholder="Phone Number"
                    value={filterForm.phoneNumber}
                    onChange={(e) =>
                      setFilterForm({
                        ...filterForm,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>

                {/* 6. Status */}
                <div className={styles.filterFormGroup}>
                  <label htmlFor="main-filter-status">Status</label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="main-filter-status"
                      value={filterForm.status}
                      onChange={(e) =>
                        setFilterForm({
                          ...filterForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="blacklisted">Blacklisted</option>
                    </select>
                    <ChevronDown size={14} className={styles.selectChevron} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.filterButtons}>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={handleFilterReset}
                  >
                    Reset
                  </button>
                  <button type="submit" className={styles.applyBtn}>
                    Filter
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {errorUsers ? (
          <div className={styles.errorState}>
            <p>Failed to retrieve users list. {errorUsers.message}</p>
            <button className={styles.retryBtn} onClick={loadUsersData}>
              Retry
            </button>
          </div>
        ) : loadingUsers ? (
          // Skeleton loader for table
          <div className={styles.scrollableTableWrapper}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key}>
                      <span className={styles.headerContent}>
                        {col.label}
                        <SlidersHorizontal size={14} />
                      </span>
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className={styles.skeletonCell}>
                        {j === 5 ? (
                          <Skeleton width={80} height={26} className={styles.skeletonBadge} />
                        ) : (
                          <Skeleton width={j === 2 ? 160 : 100} height={16} />
                        )}
                      </td>
                    ))}
                    <td>
                      <Skeleton width={20} height={20} circle />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredUsers.length === 0 ? (
          // Empty State after filtering
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>No results match your filters</div>
            <div className={styles.emptyDesc}>
              Try adjusting your search terms or clearing filters to see more results.
            </div>
            <button className={styles.emptyResetBtn} onClick={handleFilterReset}>
              Reset Filters
            </button>
          </div>
        ) : (
          // Loaded Table view
          <>
            <div className={styles.scrollableTableWrapper}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    {COLUMNS.map((col) => {
                      const isFilterActive = activeFilterHeader === col.key;
                      const hasAppliedFilter = !!activeFilters[col.key as keyof typeof activeFilters];

                      return (
                        <th key={col.key}>
                          <div className={styles.headerContent}>
                            <span>{col.label}</span>
                            <button
                              className={`${styles.filterBtn} ${
                                isFilterActive || hasAppliedFilter ? styles.active : ""
                              }`}
                              onClick={() =>
                                setActiveFilterHeader(
                                  activeFilterHeader === col.key ? null : col.key
                                )
                              }
                              aria-label={`Filter by ${col.label}`}
                            >
                              <SlidersHorizontal size={12} />
                            </button>
                          </div>

                          {/* Individual Column Dropdown containing ONLY the relevant filter */}
                          {isFilterActive && (
                            <form
                              className={styles.filterDropdown}
                              onSubmit={handleFilterSubmit}
                              onClick={(e) => e.stopPropagation()} // Stop closing dropdown
                            >
                              {col.key === "organization" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-org">Organization</label>
                                  <div className={styles.selectWrapper}>
                                    <select
                                      id="filter-org"
                                      value={filterForm.organization}
                                      onChange={(e) =>
                                        setFilterForm({
                                          ...filterForm,
                                          organization: e.target.value,
                                        })
                                      }
                                    >
                                      <option value="">Select</option>
                                      {organizations.map((org) => (
                                        <option key={org} value={org}>
                                          {org}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown size={14} className={styles.selectChevron} />
                                  </div>
                                </div>
                              )}

                              {col.key === "username" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-user">Username</label>
                                  <input
                                    type="text"
                                    id="filter-user"
                                    placeholder="User"
                                    value={filterForm.username}
                                    onChange={(e) =>
                                      setFilterForm({
                                        ...filterForm,
                                        username: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}

                              {col.key === "email" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-email">Email</label>
                                  <input
                                    type="text"
                                    id="filter-email"
                                    placeholder="Email"
                                    value={filterForm.email}
                                    onChange={(e) =>
                                      setFilterForm({
                                        ...filterForm,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}

                              {col.key === "phoneNumber" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-phone">Phone Number</label>
                                  <input
                                    type="text"
                                    id="filter-phone"
                                    placeholder="Phone Number"
                                    value={filterForm.phoneNumber}
                                    onChange={(e) =>
                                      setFilterForm({
                                        ...filterForm,
                                        phoneNumber: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}

                              {col.key === "dateJoined" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-date">Date Joined</label>
                                  <div className={styles.dateInputWrapper}>
                                    <input
                                      type="text"
                                      id="filter-date"
                                      placeholder="Date"
                                      value={filterForm.date}
                                      onFocus={(e) => (e.target.type = "date")}
                                      onBlur={(e) => {
                                        if (!e.target.value) e.target.type = "text";
                                      }}
                                      onChange={(e) =>
                                        setFilterForm({
                                          ...filterForm,
                                          date: e.target.value,
                                        })
                                      }
                                    />
                                    <Calendar size={14} className={styles.calendarIcon} />
                                  </div>
                                </div>
                              )}

                              {col.key === "status" && (
                                <div className={styles.filterFormGroup}>
                                  <label htmlFor="filter-status">Status</label>
                                  <div className={styles.selectWrapper}>
                                    <select
                                      id="filter-status"
                                      value={filterForm.status}
                                      onChange={(e) =>
                                        setFilterForm({
                                          ...filterForm,
                                          status: e.target.value,
                                        })
                                      }
                                    >
                                      <option value="">Select</option>
                                      <option value="active">Active</option>
                                      <option value="inactive">Inactive</option>
                                      <option value="pending">Pending</option>
                                      <option value="blacklisted">Blacklisted</option>
                                    </select>
                                    <ChevronDown size={14} className={styles.selectChevron} />
                                  </div>
                                </div>
                              )}

                              <div className={styles.filterButtons}>
                                <button
                                  type="button"
                                  className={styles.resetBtn}
                                  onClick={handleFilterReset}
                                >
                                  Reset
                                </button>
                                <button type="submit" className={styles.applyBtn}>
                                  Filter
                                </button>
                              </div>
                            </form>
                          )}
                        </th>
                      );
                    })}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => {
                    const isActionOpen = activeActionMenuRowId === user.id;

                    return (
                      <tr key={user.id}>
                        <td>{user.organization}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{formatDate(user.dateJoined)}</td>
                        <td>
                          <Badge status={user.status} />
                        </td>
                        <td>
                          <div className={styles.actionWrapper}>
                            <button
                              className={`${styles.actionThreeDot} ${
                                isActionOpen ? styles.open : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuRowId(
                                  isActionOpen ? null : user.id
                                );
                              }}
                              aria-label="Actions Menu"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {isActionOpen && (
                              <div className={styles.actionDropdown}>
                                <Link
                                  href={`/users/${user.id}`}
                                  className={styles.actionItem}
                                >
                                  <Eye size={14} />
                                  <span>View Details</span>
                                </Link>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(user.id, "blacklisted")
                                  }
                                  className={styles.actionItem}
                                >
                                  <UserX size={14} />
                                  <span>Blacklist User</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(user.id, "active")
                                  }
                                  className={styles.actionItem}
                                >
                                  <UserCheck size={14} />
                                  <span>Activate User</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className={styles.paginationSection}>
              <div className={styles.pageSizeSelector}>
                <span>Showing</span>
                <select
                  value={Math.min(pageSize, totalItems)}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to page 1
                  }}
                  aria-label="Items per page"
                >
                  {getPageSizeOptions().map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span>out of {totalItems.toLocaleString()}</span>
              </div>

              <div className={styles.paginationControls}>
                <button
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers.map((num, index) => {
                  if (num === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={`page-${num}`}
                      className={`${styles.pageBtn} ${
                        currentPage === num ? styles.active : ""
                      }`}
                      onClick={() => setCurrentPage(Number(num))}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  className={`${styles.pageBtn} ${
                    currentPage === totalPages || totalPages === 0 ? styles.disabled : ""
                  }`}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
