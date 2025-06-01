import {
  makeRateLimitedApiCall,
  getRateLimitStatus,
} from './utils/rateLimiter.js';

export const handler = async event => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
    };
  }

  const matchId = event.queryStringParameters?.matchId;

  if (!matchId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'matchId query parameter is required' }),
    };
  }

  if (!process.env.VITE_FOOTBALL_API_KEY) {
    console.error('API key is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key is not configured' }),
    };
  }

  try {
    console.log(
      'Rate limit status before match details call:',
      getRateLimitStatus()
    );

    // Use rate-limited API call
    const response = await makeRateLimitedApiCall(
      `https://api.football-data.org/v4/matches/${matchId}`,
      process.env.VITE_FOOTBALL_API_KEY
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error for matchId ' + matchId + ':', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Failed to fetch match details for matchId ${matchId}: ${response.statusText}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();
    console.log('Match details fetched for matchId ' + matchId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(
      'Function error for matchDetails, matchId ' + matchId + ':',
      error.message
    );
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        type: error.constructor.name,
      }),
    };
  }
};
