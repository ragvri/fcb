export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    console.log('Function starting, checking API key:', !!process.env.VITE_FOOTBALL_API_KEY);

    if (!process.env.VITE_FOOTBALL_API_KEY) {
      throw new Error('API key is not set');
    }

    const response = await fetch(
      'https://api.football-data.org/v4/teams/81/matches',
      {
        headers: {
          'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response received:', { matchCount: data.matches?.length });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        type: error.constructor.name
      })
    };
  }
}; 