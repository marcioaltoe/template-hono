/**
 * Domain business types
 */

/**
 * User roles in the system
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'guest'

/**
 * Organization status
 */
export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'pending'

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'blocked' | 'pending_verification'

/**
 * Authentication provider
 */
export type AuthProvider = 'local' | 'google' | 'github' | 'microsoft'

/**
 * Token type
 */
export type TokenType = 'access' | 'refresh' | 'reset_password' | 'email_verification'

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: SortOrder
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
