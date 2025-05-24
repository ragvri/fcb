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
  homeTeamCrest?: string | null;
  awayTeamCrest?: string | null;
}

function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamCrests, setTeamCrests] = useState<Record<number, string | null>>({});
  // const [loading, setLoading] = useState(true) // Duplicate removed by previous step
  // const [error, setError] = useState<string | null>(null)  // Duplicate removed by previous step
  const [rawMatchesData, setRawMatchesData] = useState<ApiMatch[]>([]); // New state for raw API data

  const fetchTeamCrests = async (teamIds: number[]) => {
    const crests: Record<number, string | null> = {};
    for (const id of teamIds) {
      try {
        // Adjust API URL for dev/prod if necessary. Netlify functions are typically relative.
        const response = await fetch(`/.netlify/functions/getTeamDetails?teamId=${id}`);
        if (!response.ok) {
          console.error(`Failed to fetch crest for team ${id}: ${response.status}`);
          crests[id] = null;
          continue;
        }
        const data = await response.json();
        crests[id] = data.crest; // Assuming the function returns { crest: "url" } or { crest: null }
      } catch (err) {
        console.error(`Error fetching crest for team ${id}:`, err);
        crests[id] = null;
      }
    }
    setTeamCrests(crests);
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true); // Explicitly set loading true at the start
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

        setRawMatchesData(data.matches); // Store raw data
        setError(null); // Clear any previous errors

        const uniqueTeamIds = new Set<number>();
        data.matches.forEach(match => {
          if (match.homeTeam?.id) uniqueTeamIds.add(match.homeTeam.id);
          if (match.awayTeam?.id) uniqueTeamIds.add(match.awayTeam.id);
        });

        if (uniqueTeamIds.size > 0) {
          fetchTeamCrests(Array.from(uniqueTeamIds));
        } else {
          // No teams to fetch crests for, so we can consider loading done for crests.
          // The second useEffect will still run and process the rawMatchesData.
          setTeamCrests({}); // Ensure teamCrests is not undefined for the second effect
        }
        // setMatches and setLoading(false) are removed from here
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching matches');
        setLoading(false); // Error in initial fetch, stop loading
      }
    };

    initialFetch(); // Corrected function call
  }, []);

  // New useEffect for processing data after crests are fetched
  useEffect(() => {
    if (rawMatchesData.length === 0) {
      // rawMatchesData is not yet loaded, or it's empty.
      // If it's empty because there were no matches, loading should be set to false.
      // This case might need to be handled if initialFetch completes with no matches.
      // For now, if initialFetch had an error, loading is already false.
      // If initialFetch succeeded with no matches, rawMatchesData is empty,
      // and fetchTeamCrests might not have been called.
      // Let's assume initialFetch always leads to this effect running.
      // If there are no raw matches, and no error, it implies no matches were fetched.
      if (!error && rawMatchesData.length === 0 && !loading) { // Check loading to prevent premature set
         // This condition is tricky. If initialFetch is done, and rawMatchesData is empty,
         // and no error, it means 0 matches.
         // setMatches([]); // Already default
         // setLoading(false); // Should be handled carefully
      }
      return;
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };

    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);

    const formattedMatchesWithCrests = rawMatchesData.map((match: ApiMatch) => {
      const matchDate = new Date(match.utcDate);

      const isRecentFinishedMatch = match.status === 'FINISHED' && matchDate >= fiveDaysAgo && matchDate <= now;
      const isScheduledMatch = match.status === 'SCHEDULED' || match.status === 'TIMED';
      const isLiveMatch = match.status === 'IN_PLAY' || match.status === 'PAUSED';

      if (!isRecentFinishedMatch && !isScheduledMatch && !isLiveMatch) {
        return null;
      }

      const homeTeamCrest = match.homeTeam?.id ? teamCrests[match.homeTeam.id] : null;
      const awayTeamCrest = match.awayTeam?.id ? teamCrests[match.awayTeam.id] : null;

      return {
        id: match.id,
        competition: match.competition?.name || 'Unknown Competition',
        date: matchDate.toLocaleString(undefined, options),
        homeTeam: match.homeTeam?.name || 'TBD',
        awayTeam: match.awayTeam?.name || 'TBD',
        // homeTeamId: match.homeTeam?.id, // Keep if needed for keys/debugging
        // awayTeamId: match.awayTeam?.id, // Keep if needed for keys/debugging
        homeTeamCrest,
        awayTeamCrest,
        stage: match.stage || 'Unknown Stage',
        status: match.status || 'SCHEDULED',
        score: (isLiveMatch || isRecentFinishedMatch) && match.score?.fullTime
                 ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                 : null
      };
    }).filter(Boolean) as Match[];

    setMatches(formattedMatchesWithCrests);
    if (!error) { // Only set loading to false if no error occurred in the first effect
      setLoading(false);
    }
  }, [rawMatchesData, teamCrests]); // Dependencies as per current subtask instruction

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
                <span className="team home">
                  {match.homeTeamCrest && (
                    <img src={match.homeTeamCrest} alt={`${match.homeTeam} crest`} className="team-crest" />
                  )}
                  {match.homeTeam}
                </span>
                <span className="vs">vs</span>
                <span className="team away">
                  {match.awayTeamCrest && (
                    <img src={match.awayTeamCrest} alt={`${match.awayTeam} crest`} className="team-crest" />
                  )}
                  {match.awayTeam}
                </span>
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