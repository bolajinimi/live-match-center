export type MatchStatus =
  | "NOT_STARTED"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export type MatchEventType =
  | "GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "FOUL"
  | "SHOT";

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
}

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: number;
  team: "home" | "away";
  player: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
}

export interface MatchStatistic {
  home: number;
  away: number;
}

export interface MatchStatistics {
  possession: MatchStatistic;
  shots: MatchStatistic;
  shotsOnTarget: MatchStatistic;
  corners: MatchStatistic;
  fouls: MatchStatistic;
  yellowCards: MatchStatistic;
  redCards: MatchStatistic;
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  statistics: MatchStatistics;
}

export function isLiveStatus(status: MatchStatus): boolean {
  return status === "FIRST_HALF" || status === "HALF_TIME" || status === "SECOND_HALF";
}
