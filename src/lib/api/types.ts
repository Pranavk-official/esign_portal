// src/lib/api/types.ts

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface APIError {
  detail: string | ValidationError[];
}

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
}

export interface UserDetailResponse {
  id: string;
  email: string;
  portal_id: string | null;
  is_active: boolean;
  created_at: string;
  roles: UserRole[];
}

export interface UserListResponse {
  id: string;
  email: string;
  portal_id: string | null;
  is_active: boolean;
  created_at: string;
  role_names: string[];
}

export interface AuthResponse {
  message: string;
  token_type: string;
  user: UserDetailResponse | null;
}

export interface OTPRequestResponse {
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TableQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PortalQueryParams extends TableQueryParams {
  is_active?: boolean;
}

export interface ApiKeyQueryParams extends TableQueryParams {
  environment?: "LIVE" | "TEST";
  is_active?: boolean;
}

export interface ApiUsageQueryParams extends TableQueryParams {
  api_key_id?: string;
  portal_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface UserQueryParams extends TableQueryParams {
  role_name?: string;
  is_active?: boolean;
}

// Portals
export interface PortalResponse {
  portal_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  live_key_limit: number | null;
}

export interface PortalListResponse extends PortalResponse {
  active_key_count: number;
  total_key_count: number;
  user_count: number;
  revoke_reason: string | null;
  max_keys?: number | null;
  environment?: string | null;
  description?: string | null;
  updated_at?: string | null;
}

export interface PortalOnboardingRequest {
  portal_name: string;
  admin_email: string;
}

// API Keys
export interface ApiKeyResponse {
  id: string;
  key_name: string | null;
  key_prefix: string;
  environment: string;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  max_txn_count: number | null;
  remaining_txn_count: number | null;
  successful_txn_count: number;
  max_txn_count_threshold: number | null;
}

// ApiKeyGenerateRequest is now defined in @/lib/schemas/api-key.ts

export interface ApiKeyGenerateResponse {
  key_id: string;
  api_key: string;
  message: string;
}

// API Key Metrics
export interface ApiKeyMetric {
  api_key_id: string;
  api_key_name: string | null;
  total_transactions: number;
  successful: number;
  failed: number;
  pending: number;
}

// Detailed API Key Response for Portal Details
export interface ApiKeyDetailResponse {
  id: string;
  portal_id: string;
  key_name: string | null;
  key_prefix: string;
  environment: "LIVE" | "TEST";
  callback_url: string;
  is_active: boolean;
  revoke_reason: string | null;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  max_txn_count: number | null;
  remaining_txn_count: number | null;
  successful_txn_count: number;
  max_txn_count_threshold: number | null;
}

// Per Portal Metrics with API Keys Details
export interface PortalMetricsResponse {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  last_transaction_at: string | null;
  api_keys_metrics: ApiKeyDetailResponse[];
}

// System Overview Metrics for Super Admin
export interface SystemOverviewMetrics {
  total_active_portals: number;
  total_active_users: number;
  total_active_api_keys: number;
  total_transactions: number;
  total_completed_transactions: number;
  total_failed_transactions: number;
  total_pending_transactions: number;
  success_rate: number;
}

// Metrics
export interface MetricsResponse {
  total_transactions: number;
  successful: number;
  failed: number;
  pending: number;
  last_transaction_at: string | null;
  api_keys_metrics: ApiKeyMetric[] | null;
}

export interface ApiUsageSummary {
  total_transactions: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
}

export interface ApiUsageRecord {
  gateway_txn_id: string;
  portal_id: string;
  portal_doc_id: string | null;
  api_key_id: string;
  api_key_name: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "USER_CANCELLED";
  file_hash: string;
  signed_file_hash: string | null;
  auth_mode: "AADHAAR" | "OTP" | "EKYC";
  created_at: string;
  updated_at: string;
}
