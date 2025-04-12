import { useState, useEffect } from 'react'
import './App.css'

interface Competition {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
}

interface ApiMatch {
  id: number;
  competition: Competition;
  utcDate: string;
  homeTeam: Team;
  awayTeam: Team;
  stage: string;
  status: string;
  score: {
    fullTime: {
      home: number;
      away: number;
    };
  };
}

interface ApiResponse {
  matches: ApiMatch[];
}

interface Match {
  id: number;
  competition: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  status: string;
  score: string | null;
}

function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)  // Stores any error messages that occur during fetch

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Log to verify if we're getting the API key
        console.log('API Key available:', !!import.meta.env.VITE_FOOTBALL_API_KEY);
        console.log('Making API request...');

        // Use Netlify function in production, direct API in development
        const apiUrl = import.meta.env.PROD
          ? '/api/matches'  // This will be redirected to /.netlify/functions/matches
          : '/api/v4/teams/81/matches';

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: import.meta.env.PROD
            ? {}  // No headers needed for Netlify function
            : { 'X-Auth-Token': import.meta.env.VITE_FOOTBALL_API_KEY }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            headers: Object.fromEntries(response.headers.entries())
          });
          throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse;
        console.log('API Response:', data);

        if (!data.matches) {
          throw new Error('Invalid response format: matches array not found');
        }

        const formattedMatches = data.matches.map((match: ApiMatch) => {
          const matchDate = new Date(match.utcDate);
          const now = new Date();
          const fiveDaysAgo = new Date(now);
          fiveDaysAgo.setDate(now.getDate() - 5);

          // Determine if the match should be displayed
          const isRecentFinishedMatch = match.status === 'FINISHED' && matchDate >= fiveDaysAgo && matchDate <= now;
          const isScheduledMatch = match.status === 'SCHEDULED' || match.status === 'TIMED';
          const isLiveMatch = match.status === 'IN_PLAY' || match.status === 'PAUSED';

          if (!isRecentFinishedMatch && !isScheduledMatch && !isLiveMatch) {
            return null; // Exclude matches that don't meet the criteria
          }

          const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
          return {
            id: match.id,
            competition: match.competition?.name || 'Unknown Competition',
            date: matchDate.toLocaleString(undefined, options),
            homeTeam: match.homeTeam?.name || 'TBD',
            awayTeam: match.awayTeam?.name || 'TBD',
            stage: match.stage || 'Unknown Stage',
            status: match.status || 'SCHEDULED',
            score: (isLiveMatch || isRecentFinishedMatch) ? `${match.score.fullTime.home} - ${match.score.fullTime.away}` : null
          };
        }).filter(Boolean) as Match[]; // Remove null values and cast to Match[]

        setMatches(formattedMatches);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching matches');
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <h1>Loading Barcelona's Upcoming Matches...</h1>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>Error Loading Matches</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>FC Barcelona Upcoming Matches</h1>
      <div className="matches-container">
        {matches.length === 0 ? (
          <div className="no-matches">
            <p>No upcoming matches found</p>
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-date">{match.date}</div>
              <div className="match-competition">
                {match.competition}
                <span className="match-stage"> • {match.stage.replace(/_/g, ' ')}</span>
              </div>
              <div className="match-teams">
                <span className="team home">{match.homeTeam}</span>
                <span className="vs">vs</span>
                <span className="team away">{match.awayTeam}</span>
              </div>
              <div className="match-status">{match.status}</div>
              {match.score && <div className="match-score">{match.score}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App