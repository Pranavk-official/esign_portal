import { z } from "zod";

// Validation Schemas for API Key Operations

export const apiKeyGenerateSchema = z.object({
  key_name: z
    .string()
    .trim()
    .min(3, "Key name must be at least 3 characters")
    .max(50, "Key name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Key name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),

  environment: z.enum(["LIVE", "TEST"]),

  callback_url: z
    .string()
    .trim()
    .url("Callback URL must be a valid URL")
    .regex(/^https?:\/\//, "Callback URL must start with http:// or https://"),
});

export const apiKeyRevokeSchema = z.object({
  is_active: z.boolean(),
  reason: z
    .string()
    .trim()
    .min(10, "Revoke reason must be at least 10 characters")
    .max(500, "Revoke reason must not exceed 500 characters")
    .optional()
    .nullable(),
});

export const apiKeyTxnCountUpdateSchema = z
  .object({
    max_txn_count: z
      .number()
      .int("Transaction count must be an integer")
      .positive("Transaction count must be positive")
      .optional()
      .nullable(),

    max_txn_count_threshold: z
      .number()
      .int("Threshold must be an integer")
      .positive("Threshold must be positive")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.max_txn_count_threshold && data.max_txn_count) {
        return data.max_txn_count_threshold <= data.max_txn_count;
      }
      return true;
    },
    {
      message: "Threshold cannot be greater than max transaction count",
      path: ["max_txn_count_threshold"],
    }
  );

export const callbackUrlUpdateSchema = z.object({
  callback_url: z
    .url("Callback URL must be a valid URL")
    .regex(/^https?:\/\//, "Callback URL must start with http:// or https://"),
});

// Response Validation Schemas
export const apiKeyResponseSchema = z.object({
  id: z.uuid(),
  key_name: z.string().nullable(),
  key_prefix: z.string(),
  environment: z.enum(["LIVE", "TEST"]),
  callback_url: z.string().url(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
  last_used_at: z.string().datetime().nullable(),
  max_txn_count: z.number().int().nullable(),
  remaining_txn_count: z.number().int().nullable(),
  successful_txn_count: z.number().int(),
  max_txn_count_threshold: z.number().int().nullable(),
});

export const apiKeyGenerateResponseSchema = z.object({
  api_key: z.string(),
  key_id: z.uuid(),
  key_name: z.string(),
  environment: z.enum(["LIVE", "TEST"]),
  created_at: z.string().datetime(),
});

// Type exports - Request types
export type ApiKeyGenerateRequest = z.infer<typeof apiKeyGenerateSchema>;
export type ApiKeyRevokeRequest = z.infer<typeof apiKeyRevokeSchema>;
export type ApiKeyTxnCountUpdateRequest = z.infer<typeof apiKeyTxnCountUpdateSchema>;
export type CallbackUrlUpdateRequest = z.infer<typeof callbackUrlUpdateSchema>;

// Response type exports
export type ApiKeyResponse = z.infer<typeof apiKeyResponseSchema>;
export type ApiKeyGenerateResponse = z.infer<typeof apiKeyGenerateResponseSchema>;
