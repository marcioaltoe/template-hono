/**
 * Domain utility types
 */

/**
 * Represents a constructor type
 */
export type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * Makes all properties of T required recursively
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

/**
 * Makes all properties of T readonly recursively
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>
    }
  : T

/**
 * Extracts the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * Makes specified keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Makes specified keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Excludes null and undefined from T
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * Makes properties nullable
 */
export type Nullable<T> = T | null

/**
 * Makes properties optional and nullable
 */
export type Optional<T> = T | null | undefined

/**
 * Represents a value that can be a promise or not
 */
export type MaybePromise<T> = T | Promise<T>

/**
 * Represents a value that can be an array or not
 */
export type MaybeArray<T> = T | T[]
