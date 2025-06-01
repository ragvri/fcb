// Rate limiting utility for football-data.org API (10 calls/minute limit)

// In-memory storage for rate limiting (in production, you might want to use Redis or similar)
let apiCallQueue = [];
const MAX_CALLS_PER_MINUTE = 10;
const MINUTE_IN_MS = 60 * 1000;

/**
 * Check if we can make an API call without exceeding rate limits
 * @returns {boolean} - true if call is allowed, false if rate limited
 */
export function isCallAllowed() {
  const now = Date.now();

  // Remove calls older than 1 minute
  apiCallQueue = apiCallQueue.filter(
    timestamp => now - timestamp < MINUTE_IN_MS
  );

  // Check if we're under the limit
  return apiCallQueue.length < MAX_CALLS_PER_MINUTE;
}

/**
 * Record an API call timestamp
 */
export function recordCall() {
  apiCallQueue.push(Date.now());
}

/**
 * Get how many calls are available in the current minute window
 * @returns {number} - number of available calls
 */
export function getAvailableCalls() {
  const now = Date.now();

  // Remove calls older than 1 minute
  apiCallQueue = apiCallQueue.filter(
    timestamp => now - timestamp < MINUTE_IN_MS
  );

  return Math.max(0, MAX_CALLS_PER_MINUTE - apiCallQueue.length);
}

/**
 * Get time until next call is allowed (in milliseconds)
 * @returns {number} - milliseconds until next call is allowed, 0 if call is allowed now
 */
export function getTimeUntilNextCall() {
  if (isCallAllowed()) {
    return 0;
  }

  const now = Date.now();
  const oldestCall = Math.min(...apiCallQueue);
  return oldestCall + MINUTE_IN_MS - now;
}

/**
 * Wait for rate limit to allow next call
 * @returns {Promise<void>} - resolves when call is allowed
 */
export async function waitForRateLimit() {
  const waitTime = getTimeUntilNextCall();
  if (waitTime > 0) {
    console.log(
      `Rate limit reached. Waiting ${waitTime}ms before next API call...`
    );
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

/**
 * Make a rate-limited API call to football-data.org
 * @param {string} url - API endpoint URL
 * @param {string} apiKey - API key
 * @returns {Promise<Response>} - fetch response
 */
export async function makeRateLimitedApiCall(url, apiKey) {
  // Wait if necessary to respect rate limits
  await waitForRateLimit();

  // Record this call
  recordCall();

  console.log(`Making API call to: ${url.replace(apiKey, '[REDACTED]')}`);
  console.log(
    `Remaining calls in current minute window: ${getAvailableCalls() - 1}`
  );

  // Make the actual API call
  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  });

  return response;
}

/**
 * Get rate limiting status for debugging
 * @returns {object} - current rate limiting status
 */
export function getRateLimitStatus() {
  const now = Date.now();
  apiCallQueue = apiCallQueue.filter(
    timestamp => now - timestamp < MINUTE_IN_MS
  );

  return {
    callsMadeInLastMinute: apiCallQueue.length,
    availableCalls: getAvailableCalls(),
    timeUntilNextCall: getTimeUntilNextCall(),
    isCallAllowed: isCallAllowed(),
  };
}
