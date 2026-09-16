export const SESSION_CAPTURE_ATTEMPTS = 2;

const RETRYABLE_SESSION_CAPTURE_FAILURE_PATTERNS = [
  /Session capture did not create an authenticated session/i,
  /authStatus=5\d\d/i,
  /authBody=no available server/i,
  /no available server/i,
  /net::/i,
  /browserType\.launch/i,
  /Target page, context or browser has been closed/i
];

export function isRetryableSessionCaptureFailure(message: string): boolean {
  return RETRYABLE_SESSION_CAPTURE_FAILURE_PATTERNS.some((pattern) => pattern.test(message));
}
