/**
 * Domain identifier types
 */

/**
 * ISO date string
 */
export type ISODateString = string & { readonly brand: unique symbol }

/**
 * UUID v4 string
 */
export type UUID = string & { readonly brand: unique symbol }

/**
 * ULID string
 */
export type ULID = string & { readonly brand: unique symbol }

/**
 * Entity ID (can be UUID or ULID)
 */
export type EntityId = UUID | ULID

/**
 * User ID
 */
export type UserId = UUID & { readonly userBrand: unique symbol }

/**
 * Organization ID
 */
export type OrganizationId = UUID & { readonly orgBrand: unique symbol }

/**
 * Company ID
 */
export type CompanyId = UUID & { readonly companyBrand: unique symbol }

/**
 * Session ID
 */
export type SessionId = string & { readonly sessionBrand: unique symbol }

/**
 * API Key ID
 */
export type ApiKeyId = string & { readonly apiKeyBrand: unique symbol }
