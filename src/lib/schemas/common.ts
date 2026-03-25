import { z } from "zod";

/**
 * Common Zod Schemas
 *
 * Shared schemas and utilities for type-safe validation.
 */

// Nullable helper type
export type Nullable<T> = T | null;

// Paginated response schema factory
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_pages: z.number().int().nonnegative(),
  });
}

// Common pagination type
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

// Common query parameters schema
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().optional(),
});

export const sortParamsSchema = z.object({
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export const searchParamsSchema = z.object({
  search: z.string().optional().nullable(),
});

// Combined common query params
export const baseQueryParamsSchema = paginationParamsSchema
  .merge(sortParamsSchema)
  .merge(searchParamsSchema);

export type BaseQueryParams = z.infer<typeof baseQueryParamsSchema>;
