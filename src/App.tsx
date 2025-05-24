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
  const [allApiMatches, setAllApiMatches] = useState<ApiMatch[]>([]); // Renamed state
  const [pendingDisplayMatches, setPendingDisplayMatches] = useState<ApiMatch[]>([]); // New state

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

        setAllApiMatches(data.matches); // Use renamed state setter
        setError(null); // Clear any previous errors

        // Filtering logic moved from the second useEffect
        // const options: Intl.DateTimeFormatOptions = { // Options not needed for just filtering
        //   weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        //   hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
        // };
        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 5);

        const filteredApiMatches = data.matches.filter(match => {
          const matchDate = new Date(match.utcDate);
          const isRecentFinishedMatch = match.status === 'FINISHED' && matchDate >= fiveDaysAgo && matchDate <= now;
          const isScheduledMatch = match.status === 'SCHEDULED' || match.status === 'TIMED';
          const isLiveMatch = match.status === 'IN_PLAY' || match.status === 'PAUSED';
          return isRecentFinishedMatch || isScheduledMatch || isLiveMatch;
        });

        setPendingDisplayMatches(filteredApiMatches);

        // fetchTeamCrests and related logic REMOVED from here
        // setLoading(false) is NOT called here on success path
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching matches');
        setLoading(false); // Error in initial fetch, stop loading
      }
    };

    initialFetch(); // Corrected function call
  }, []);

  // useEffect for fetching crests based on pendingDisplayMatches (Plan Step 2)
  useEffect(() => {
    // Only proceed if pendingDisplayMatches has been set by initialFetch
    if (pendingDisplayMatches === null || typeof pendingDisplayMatches === 'undefined') {
      return; // initialFetch hasn't populated this yet
    }

    if (pendingDisplayMatches.length === 0) {
      // initialFetch completed and found no matches to display.
      setTeamCrests({});
      setMatches([]);
      setLoading(false); // Safe to stop loading, nothing to show.
      return;
    }

    const uniqueTeamIds = new Set<number>();
    pendingDisplayMatches.forEach(match => {
      // Ensure match and team objects exist before accessing id
      if (match.homeTeam?.id) uniqueTeamIds.add(match.homeTeam.id);
      if (match.awayTeam?.id) uniqueTeamIds.add(match.awayTeam.id);
    });

    if (uniqueTeamIds.size > 0) {
      fetchTeamCrests(Array.from(uniqueTeamIds));
    } else {
      // Matches are pending display, but they have no team IDs (or no teams).
      // Clear crests. The next useEffect will format these matches without crests.
      setTeamCrests({});
      // setLoading(false) will be handled by the next useEffect.
    }
  }, [pendingDisplayMatches]); // Dependency: pendingDisplayMatches

  // Final useEffect for formatting matches with crests and updating UI (Plan Step 3)
  useEffect(() => {
    if (pendingDisplayMatches === null || typeof pendingDisplayMatches === 'undefined') {
      return; // Data not ready yet from initialFetch or preceding useEffect
    }

    // If pendingDisplayMatches IS defined, but empty, the previous useEffect 
    // (Plan Step 2) already handled setMatches([]) and setLoading(false).
    if (pendingDisplayMatches.length === 0) {
      return; // Nothing to format or display.
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

    // Temporary: Just to keep things running. This will be replaced in Step 3.
    // This uses allApiMatches, but in future step it should use pendingDisplayMatches.
    // For now, this is a placeholder to ensure the structure doesn't break.
    const formattedMatchesWithCrests = allApiMatches.map((match: ApiMatch) => {
      // This is a simplified mapping without the filtering, as filtering is now in initialFetch.
      // It also doesn't use pendingDisplayMatches yet. This is a temporary bridge.
      const matchDate = new Date(match.utcDate);
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
    }).filter(Boolean) as Match[]; // This filter(Boolean) might be redundant if previous filter worked

    setMatches(formattedMatchesWithCrests); // This will be updated in Step 3
    if (!error && (allApiMatches.length > 0 || pendingDisplayMatches.length > 0 || !loading) ) {
      // Condition for setLoading(false) will be refined.
      // For now, if we have processed some matches or initial load is expected to be done.
      // setLoading(false); // This will be managed more carefully in Step 3
    }
  }, [allApiMatches, teamCrests, error, loading, pendingDisplayMatches]); // Dependencies updated, will be refined in Step 3

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