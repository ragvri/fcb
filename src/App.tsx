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
}

function App() {
  const [matches, setMatches] = useState<Match[]>([])  // Stores the array of Match objects fetched from the API
  const [loading, setLoading] = useState(true)         // Tracks loading state during API fetch
  const [error, setError] = useState<string | null>(null)  // Stores any error messages that occur during fetch

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // barcelona is at id 81
        const response = await fetch('/api/v4/teams/81/matches?status=SCHEDULED', {
          method: 'GET'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse;
        console.log('API Response:', data);

        if (!data.matches) {
          throw new Error('Invalid response format: matches array not found');
        }

        const formattedMatches: Match[] = data.matches.map((match: ApiMatch) => ({
          id: match.id,
          competition: match.competition?.name || 'Unknown Competition',
          date: new Date(match.utcDate).toLocaleString(),
          homeTeam: match.homeTeam?.name || 'TBD',
          awayTeam: match.awayTeam?.name || 'TBD',
          stage: match.stage || 'Unknown Stage',
          status: match.status || 'SCHEDULED'
        }));

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
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App 