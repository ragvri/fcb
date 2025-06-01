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

  const competitionCode = event.queryStringParameters?.competitionCode;

  if (!competitionCode) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'competitionCode query parameter is required',
      }),
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
      'Rate limit status before standings call:',
      getRateLimitStatus()
    );

    // Use rate-limited API call
    const response = await makeRateLimitedApiCall(
      `https://api.football-data.org/v4/competitions/${competitionCode}/standings`,
      process.env.VITE_FOOTBALL_API_KEY
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error for competitionCode ' + competitionCode + ':', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Failed to fetch standings for competition ${competitionCode}: ${response.statusText}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();
    console.log('Standings fetched for competitionCode ' + competitionCode);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(
      'Function error for getStandings, competitionCode ' +
        competitionCode +
        ':',
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
