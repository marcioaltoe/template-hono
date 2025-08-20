/**
 * JSON types for infrastructure layer
 */

/**
 * JSON primitive values
 */
export type JsonPrimitive = string | number | boolean | null

/**
 * JSON object
 */
export type JsonObject = { [key: string]: JsonValue }

/**
 * JSON array
 */
export type JsonArray = JsonValue[]

/**
 * Any valid JSON value
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

/**
 * JSON serializable type
 */
export type JsonSerializable<T> = T extends JsonValue
  ? T
  : T extends Date
    ? string
    : T extends undefined
      ? never
      : T extends (...args: any[]) => any
        ? never
        : T extends object
          ? { [K in keyof T]: JsonSerializable<T[K]> }
          : never
