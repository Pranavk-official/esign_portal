// src/lib/api/types.ts
export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

export interface APIError {
  detail: string | ValidationError[];
}