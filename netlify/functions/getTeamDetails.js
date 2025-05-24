export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  const teamId = event.queryStringParameters.teamId;

  if (!teamId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'teamId query parameter is required' })
    };
  }

  if (!process.env.VITE_FOOTBALL_API_KEY) {
    console.error('API key is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key is not configured' })
    };
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${teamId}`,
      {
        headers: {
          'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error for teamId ' + teamId + ':', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Failed to fetch team data for teamId ${teamId}: ${response.statusText}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    // We are interested in the crest, but will return the whole team object for flexibility
    // or just { crest: data.crest } if we want to be minimal.
    // For now, let's return the crest directly.
    if (!data.crest) {
         console.warn('Crest not found for teamId ' + teamId + '. API response:', data);
         // Return null or an empty string if crest is not available but the request was otherwise successful
         return {
            statusCode: 200, // Or 404 if we consider missing crest as "not found"
            headers,
            body: JSON.stringify({ crest: null }) // Explicitly return null for crest
         };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ crest: data.crest })
    };

  } catch (error) {
    console.error('Function error for getTeamDetails, teamId ' + teamId + ':', error.message);
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
