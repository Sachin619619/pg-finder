// ── Input Validation Helpers ──

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SCRIPT_TAG_REGEX = /<\s*\/?\s*script[^>]*>/gi;
const HTML_TAG_REGEX = /<[^>]*>/g;

/** Check if string is a valid email address */
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

/** Check if string is a valid Indian 10-digit mobile number */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== "string") return false;
  const cleaned = phone.replace(/[\s\-+()]/g, "");
  // Handle +91 or 91 prefix
  const digits = cleaned.startsWith("91") && cleaned.length === 12
    ? cleaned.slice(2)
    : cleaned;
  return PHONE_REGEX.test(digits);
}

/** Check if string is a valid UUID (v4 format) */
export function isValidUUID(id: string): boolean {
  if (typeof id !== "string") return false;
  return UUID_REGEX.test(id.trim());
}

/** Sanitize a string: trim, remove script tags, strip dangerous HTML, limit length */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .slice(0, maxLength);
}

/** Check if value is a non-empty string after trimming */
export function isNonEmptyString(str: unknown): str is string {
  return typeof str === "string" && str.trim().length > 0;
}

/** Validate a number is within a range (inclusive) */
export function isValidNumber(value: unknown, min: number, max: number): boolean {
  if (typeof value !== "number" || isNaN(value)) return false;
  return value >= min && value <= max;
}

/** Validate a price value for PG listings (reasonable range for Bangalore) */
export function isValidPrice(price: unknown): boolean {
  return isValidNumber(price, 500, 200000);
}

/** Validate a rating value */
export function isValidRating(rating: unknown): boolean {
  return isValidNumber(rating, 0, 5);
}

/** Validate gender field */
export function isValidGender(gender: string): boolean {
  return ["male", "female", "coed"].includes(gender.toLowerCase());
}

/** Validate room type */
export function isValidRoomType(type: string): boolean {
  return ["single", "double", "triple", "any"].includes(type.toLowerCase());
}

/** Build a 400 error response */
export function validationError(message: string) {
  return { error: message };
}
