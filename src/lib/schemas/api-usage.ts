import { z } from "zod";

import { baseQueryParamsSchema } from "./common";

/**
 * API Usage Schemas
 *
 * Zod schemas for eSign transaction usage tracking.
 */

// Transaction status enum
export const transactionStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "USER_CANCELLED",
  "CANCELLED",
]);

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// API Usage Record Schema
export const apiUsageRecordSchema = z.object({
  gateway_txn_id: z.string(),
  portal_id: z.string().uuid(),
  api_key_id: z.string().uuid().nullable(),
  api_key_name: z.string().nullable(),
  portal_doc_id: z.string().nullable(),
  status: z.string(), // Could be transactionStatusSchema but API returns string
  auth_mode: z.string().nullable(),
  file_hash: z.string(),
  signed_file_hash: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export type ApiUsageRecord = z.infer<typeof apiUsageRecordSchema>;

// API Usage Summary Schema
export const apiUsageSummarySchema = z.object({
  total_transactions: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
});

export type ApiUsageSummary = z.infer<typeof apiUsageSummarySchema>;

// Query Parameters Schema
export const apiUsageQueryParamsSchema = baseQueryParamsSchema.extend({
  portal_id: z.string().uuid().optional().nullable(),
  api_key_id: z.string().uuid().optional().nullable(),
  status: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type ApiUsageQueryParams = z.infer<typeof apiUsageQueryParamsSchema>;
