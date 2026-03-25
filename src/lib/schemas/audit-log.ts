import { z } from "zod";

import { baseQueryParamsSchema } from "./common";

/**
 * Audit Log Schemas
 *
 * Zod schemas for system audit logging and activity tracking.
 */

// Audit Log Record Schema
export const auditLogRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  user_email: z.string().email().nullable(),
  portal_id: z.string().uuid().nullable(),
  event_type: z.string(),
  resource_type: z.string().nullable(),
  resource_id: z.string().nullable(),
  details: z.record(z.string(), z.any()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  timestamp: z.string().datetime(),
});

export type AuditLogRecord = z.infer<typeof auditLogRecordSchema>;

// Query Parameters Schema
export const auditLogQueryParamsSchema = baseQueryParamsSchema.extend({
  user_id: z.string().uuid().optional().nullable(),
  portal_id: z.string().uuid().optional().nullable(),
  event_type: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type AuditLogQueryParams = z.infer<typeof auditLogQueryParamsSchema>;
