import { UsersListResponse, SingleUserResponseData } from '../types/user';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || 'mock-jwt-token-lendsqr-12345';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  organization?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  dateFrom?: string;
}

/**
 * Fetches users list from the mock API.
 * Handles client-side search parameters and authorization.
 */
export async function fetchUsers(params: FetchUsersParams = {}): Promise<UsersListResponse> {
  // Construct URL using window location so it is absolute in both browser and node testing environments
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const url = new URL(`${origin}${API_BASE}/users`);

  if (params.page) url.searchParams.append('page', params.page.toString());
  if (params.limit) url.searchParams.append('limit', params.limit.toString());
  if (params.organization) url.searchParams.append('organization', params.organization);
  if (params.username) url.searchParams.append('username', params.username);
  if (params.email) url.searchParams.append('email', params.email);
  if (params.phoneNumber) url.searchParams.append('phoneNumber', params.phoneNumber);
  if (params.status) url.searchParams.append('status', params.status);
  if (params.dateFrom) url.searchParams.append('dateFrom', params.dateFrom);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches a single user details by ID.
 */
export async function fetchUserById(id: string): Promise<SingleUserResponseData> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const res = await fetch(`${origin}${API_BASE}/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export interface LoginResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
  };
}

/**
 * Logins the user. If successful, stores the mock JWT token in localStorage.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const res = await fetch(`${origin}${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  const result = await res.json();
  if (typeof window !== 'undefined' && result.data?.token) {
    localStorage.setItem('token', result.data.token);
  }
  return result;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersWithLoans: number;
  usersWithSavings: number;
}

export interface UserStatsResponse {
  status: string;
  message: string;
  data: UserStats;
}

/**
 * Fetches user statistics from mock API.
 */
export async function fetchUserStats(): Promise<UserStatsResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const res = await fetch(`${origin}${API_BASE}/users/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

/**
 * Updates a user's status.
 */
export async function updateUserStatus(id: string, status: string): Promise<SingleUserResponseData> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const res = await fetch(`${origin}${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

