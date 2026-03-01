import { errorResponse } from "../utils/response.js";

/**
 * Validation middleware factory.
 * @param { (req) => ({ valid: boolean, message?: string, errors?: object }) } validate - Sync or async validator. Return { valid: true } or { valid: false, message, errors }.
 */
export function validate(validateFn) {
  return async (req, res, next) => {
    try {
      const result = await Promise.resolve(validateFn(req));
      if (result.valid) return next();
      return errorResponse(res, {
        statusCode: 400,
        message: result.message ?? "Validation failed",
        error: result.errors ?? null,
      });
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Simple body-field validator. Fails if any required field is missing or empty string.
 * @param {string[]} requiredFields - Keys that must be present and non-empty in req.body.
 */
export function requireBody(...requiredFields) {
  return validate((req) => {
    const missing = requiredFields.filter((key) => {
      const v = req.body?.[key];
      return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
    });
    if (missing.length === 0) return { valid: true };
    return {
      valid: false,
      message: `Missing or empty: ${missing.join(", ")}`,
      errors: { missing },
    };
  });
}
