/**
 * Validation Utilities
 * 
 * Provides helpers for runtime validation using Zod schemas with safeParse.
 * Enables graceful error handling without throwing exceptions.
 */

import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Validates data against a Zod schema using safeParse.
 * Returns validated data on success, or shows error toast and returns null on failure.
 * 
 * @example
 * const validated = validateWithSchema(userCreateSchema, formData);
 * if (!validated) return; // Validation failed, error already shown
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: {
    showToast?: boolean;
    errorMessage?: string;
  }
): T | null {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return result.data;
  }
  
  // Extract validation errors
  const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
  
  if (options?.showToast !== false) {
    toast.error(options?.errorMessage || `Validation failed: ${errors}`);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Validation failed:', result.error.issues);
  }
  
  return null;
}

/**
 * Creates a validated API endpoint function that validates request data before sending.
 * Uses safeParse for graceful error handling.
 * 
 * @example
 * const createUser = createValidatedEndpoint(
 *   userCreateSchema,
 *   async (data) => apiClient.post('/users', data)
 * );
 */
export function createValidatedEndpoint<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  fn: (data: TInput) => Promise<TOutput>,
  options?: {
    validateResponse?: z.ZodSchema<TOutput>;
    errorMessage?: string;
  }
) {
  return async (data: unknown): Promise<TOutput> => {
    // Validate request data
    const validated = validateWithSchema(schema, data, {
      showToast: true,
      errorMessage: options?.errorMessage,
    });
    
    if (!validated) {
      throw new Error('Validation failed');
    }
    
    // Execute API call
    const response = await fn(validated);
    
    // Optionally validate response
    if (options?.validateResponse) {
      const validatedResponse = validateWithSchema(options.validateResponse, response, {
        showToast: false, // Don't show toast for response validation
      });
      
      if (!validatedResponse) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Response validation failed:', response);
        }
        throw new Error('Invalid response from server');
      }
      
      return validatedResponse;
    }
    
    return response;
  };
}

/**
 * Validates response data from API calls.
 * Logs errors in development but doesn't show toast to users.
 * 
 * @example
 * const user = validateResponse(userDetailResponseSchema, apiResponse);
 * if (!user) throw new Error('Invalid response');
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  return validateWithSchema(schema, data, {
    showToast: false, // Don't show toast for response validation
    errorMessage: 'Invalid response from server',
  });
}
