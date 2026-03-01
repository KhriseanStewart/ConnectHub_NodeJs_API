import crypto from "crypto";

export const OTP_LENGTH = 6;
export const OTP_EXPIRES_MINUTES = 10;

function getPepper() {
  return process.env.OTP_PEPPER || process.env.JWT_SECRET || "";
}

/** Generate a 6-digit numeric OTP (e.g. "042817"). */
export function generateNumericOtp(len = OTP_LENGTH) {
  const max = 10 ** len;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(len, "0");
}

/** Hash OTP with pepper before storing. Compare hashes when verifying. */
export function hashOtp(otp) {
  return crypto.createHash("sha256").update(`${otp}.${getPepper()}`).digest("hex");
}
