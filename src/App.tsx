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
  competitionId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  status: string;
  score: string | null;
  homeTeamCrest?: string | null;
  awayTeamCrest?: string | null;
}

// Standings interfaces
interface StandingsTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface StandingsEntry {
  position: number;
  team: StandingsTeam;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface StandingsTable {
  stage: string;
  type: string;
  group: string | null;
  table: StandingsEntry[];
}

interface StandingsResponse {
  filters: {
    season: string;
  };
  area: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: any;
  };
  standings: StandingsTable[];
}

function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamCrests, setTeamCrests] = useState<Record<number, string | null>>({});
  const [pendingDisplayMatches, setPendingDisplayMatches] = useState<ApiMatch[] | null>(null);
  const [crestsFetchComplete, setCrestsFetchComplete] = useState(false);

  // Standings state
  const [showStandings, setShowStandings] = useState(false);
  const [standingsData, setStandingsData] = useState<StandingsResponse | null>(null);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<{ name: string, code: string } | null>(null);

  const fetchTeamCrests = async (teamIds: number[]) => {
    const crests: Record<number, string | null> = {};
    console.log(`Fetching crests for ${teamIds.length} teams with rate limiting...`);

    // Process team crests sequentially with a small delay to avoid overwhelming the rate limiter
    for (let i = 0; i < teamIds.length; i++) {
      const id = teamIds[i];
      try {
        // Add a small delay between requests to be extra careful with rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between team crest calls
        }

        console.log(`Fetching crest for team ${id} (${i + 1}/${teamIds.length})`);
        const response = await fetch(`/.netlify/functions/getTeamDetails?teamId=${id}`);

        if (!response.ok) {
          console.error(`Failed to fetch crest for team ${id}: ${response.status}`);
          crests[id] = null;
          continue;
        }

        const data = await response.json();
        crests[id] = data.crest;
        console.log(`✓ Crest fetched for team ${id}`);
      } catch (err) {
        console.error(`Error fetching crest for team ${id}:`, err);
        crests[id] = null;
      }
    }

    console.log('All team crests fetched');
    setTeamCrests(crests);
    setCrestsFetchComplete(true);
  };

  const fetchStandings = async (competitionName: string, competitionId: number) => {
    setStandingsLoading(true);
    setStandingsError(null);

    // Map competition names to their codes - we'll need to determine these from the matches
    const competitionCodeMap: Record<string, string> = {
      'La Liga': 'PD',
      'Primera Division': 'PD',
      'UEFA Champions League': 'CL',
      'Copa del Rey': 'CDR',
      'Supercopa de España': 'SUPERCOPA',
      'UEFA Super Cup': 'SUPEREUROCUP',
      'FIFA Club World Cup': 'CWC'
    };

    // Try to find competition code by name, fallback to ID-based logic
    let competitionCode = competitionCodeMap[competitionName];

    // If we don't have a direct mapping, try some common ID mappings
    if (!competitionCode) {
      const idCodeMap: Record<number, string> = {
        2014: 'PD',  // La Liga
        2001: 'CL',  // Champions League
        2015: 'CDR', // Copa del Rey
      };
      competitionCode = idCodeMap[competitionId];
    }

    if (!competitionCode) {
      setStandingsError(`Unable to determine competition code for "${competitionName}". Standings may not be available for this competition.`);
      setStandingsLoading(false);
      return;
    }

    try {
      console.log(`📊 Fetching standings for ${competitionName} (${competitionCode})`);

      // Always use the Netlify function to avoid CORS issues
      const apiUrl = `/.netlify/functions/getStandings?competitionCode=${competitionCode}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Standings API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        // Check for rate limiting error
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }

        throw new Error(`Failed to fetch standings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as StandingsResponse;
      console.log('✓ Standings data received');
      setStandingsData(data);
      setSelectedCompetition({ name: competitionName, code: competitionCode });
      setShowStandings(true);
    } catch (err) {
      console.error('Error fetching standings:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching standings';
      setStandingsError(errorMessage);
    } finally {
      setStandingsLoading(false);
    }
  };

  const handleCompetitionClick = (competitionName: string, competitionId: number) => {
    fetchStandings(competitionName, competitionId);
  };

  const closeStandings = () => {
    setShowStandings(false);
    setStandingsData(null);
    setStandingsError(null);
    setSelectedCompetition(null);
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

        setError(null); // Clear any previous errors

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
      console.log('fetching total of ', uniqueTeamIds.size, 'team crests');
      fetchTeamCrests(Array.from(uniqueTeamIds));
    } else {
      // Matches are pending display, but they have no team IDs (or no teams).
      // Clear crests. The next useEffect will format these matches without crests.
      setTeamCrests({});
      setCrestsFetchComplete(true); // Mark as complete since no crests needed
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
      return;
    }

    // Check if we have all the team crests that we need
    const uniqueTeamIds = new Set<number>();
    pendingDisplayMatches.forEach(match => {
      if (match.homeTeam?.id) uniqueTeamIds.add(match.homeTeam.id);
      if (match.awayTeam?.id) uniqueTeamIds.add(match.awayTeam.id);
    });

    // Wait for crest fetching to complete (either successfully or unsuccessfully)
    // This is safer than checking if all crests loaded, as it handles fetch failures gracefully
    if (uniqueTeamIds.size > 0 && !crestsFetchComplete) {
      // Still waiting for team crests fetch to complete, keep showing loading
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

    const finalFormattedMatches = pendingDisplayMatches.map((apiMatch: ApiMatch) => {
      // **** ADD DEFINITIONS HERE (as per subtask instructions) ****
      const matchDate = new Date(apiMatch.utcDate);
      const now = new Date();
      const fiveDaysAgo = new Date(now);
      fiveDaysAgo.setDate(now.getDate() - 5);

      const isRecentFinishedMatch = apiMatch.status === 'FINISHED' && matchDate >= fiveDaysAgo && matchDate <= now;
      const isLiveMatch = apiMatch.status === 'IN_PLAY' || apiMatch.status === 'PAUSED';
      // *****************************

      const homeCrest = apiMatch.homeTeam?.id ? teamCrests[apiMatch.homeTeam.id] : null;
      const awayCrest = apiMatch.awayTeam?.id ? teamCrests[apiMatch.awayTeam.id] : null;

      const scoreString = (isLiveMatch || isRecentFinishedMatch) && apiMatch.score?.fullTime
        ? `${apiMatch.score.fullTime.home} - ${apiMatch.score.fullTime.away}`
        : null;

      return {
        id: apiMatch.id,
        competition: apiMatch.competition?.name || 'Unknown Competition',
        competitionId: apiMatch.competition?.id || 0,
        date: matchDate.toLocaleString(undefined, options), // matchDate is now defined locally
        homeTeam: apiMatch.homeTeam?.name || 'TBD',
        awayTeam: apiMatch.awayTeam?.name || 'TBD',
        homeTeamCrest: homeCrest,
        awayTeamCrest: awayCrest,
        stage: apiMatch.stage || 'Unknown Stage',
        status: apiMatch.status, // status from apiMatch
        score: scoreString, // Uses locally defined isLiveMatch & isRecentFinishedMatch
      };
    });

    setMatches(finalFormattedMatches as Match[]);

    // Only stop loading if no error occurred and we have all data including crests
    if (!error) {
      setLoading(false);
    }
  }, [pendingDisplayMatches, teamCrests, crestsFetchComplete, error]); // Corrected dependencies

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
                <span
                  className="competition-name clickable"
                  onClick={() => handleCompetitionClick(match.competition, match.competitionId)}
                  title="Click to view standings"
                >
                  {match.competition}
                </span>
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

      {/* Standings Modal */}
      {showStandings && (
        <div className="standings-modal-overlay" onClick={closeStandings}>
          <div className="standings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="standings-header">
              <h2>{selectedCompetition?.name} - Standings</h2>
              <button className="close-button" onClick={closeStandings}>&times;</button>
            </div>

            {standingsLoading && (
              <div className="standings-loading">
                <div className="loading-spinner"></div>
                <p>Loading standings...</p>
              </div>
            )}

            {standingsError && (
              <div className="standings-error">
                <p>{standingsError}</p>
              </div>
            )}

            {standingsData && standingsData.standings && standingsData.standings.length > 0 && (
              <div className="standings-content">
                <div className="competition-info">
                  <img src={standingsData.competition.emblem} alt={standingsData.competition.name} className="competition-emblem" />
                  <div>
                    <h3>{standingsData.competition.name}</h3>
                    <p>Season {standingsData.filters.season} • Matchday {standingsData.season.currentMatchday}</p>
                  </div>
                </div>

                {standingsData.standings.map((standing, index) => (
                  <div key={index} className="standings-table-container">
                    <h4>{standing.stage.replace(/_/g, ' ')} - {standing.type}</h4>
                    <div className="standings-table">
                      <div className="standings-header-row">
                        <span className="pos">Pos</span>
                        <span className="team">Team</span>
                        <span className="played">P</span>
                        <span className="won">W</span>
                        <span className="draw">D</span>
                        <span className="lost">L</span>
                        <span className="goals">GF</span>
                        <span className="goals">GA</span>
                        <span className="gd">GD</span>
                        <span className="points">Pts</span>
                      </div>

                      {standing.table.map((entry) => (
                        <div
                          key={entry.team.id}
                          className={`standings-row ${entry.team.name.includes('Barcelona') || entry.team.name.includes('FC Barcelona') ? 'barcelona-row' : ''}`}
                        >
                          <span className="pos">{entry.position}</span>
                          <span className="team">
                            <img src={entry.team.crest} alt={entry.team.shortName} className="team-crest-small" />
                            <span className="team-name">{entry.team.shortName}</span>
                          </span>
                          <span className="played">{entry.playedGames}</span>
                          <span className="won">{entry.won}</span>
                          <span className="draw">{entry.draw}</span>
                          <span className="lost">{entry.lost}</span>
                          <span className="goals">{entry.goalsFor}</span>
                          <span className="goals">{entry.goalsAgainst}</span>
                          <span className="gd">{entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}</span>
                          <span className="points">{entry.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App