/**
 * Local mock of the ProFootball backend (REST + Socket.IO), used for
 * development while the real API at profootball.srv883830.hstgr.cloud is
 * unreachable. Mirrors the response shapes and socket event contract from
 * the assessment doc as closely as possible. Not used in production.
 *
 * Run with: npm run mock
 */
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { drawFixture, randomFrom, PLAYER_POOL } = require("./teams");

const PORT = process.env.MOCK_PORT || 4000;
const TICK_MS = 1000; // 1 second = 1 match minute, per the assessment notes
const LIVE_STATUSES = new Set(["FIRST_HALF", "HALF_TIME", "SECOND_HALF"]);

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---------------------------------------------------------------------------
// In-memory match store
// ---------------------------------------------------------------------------

const usedTeamNames = new Set();

function emptyStats() {
  return {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
  };
}

function makeTeam(t) {
  return { id: crypto.randomUUID(), name: t.name, shortName: t.shortName };
}

function createMatch({ status = "NOT_STARTED", minute = 0, kickoffInSeconds = 10 } = {}) {
  const [homeT, awayT] = drawFixture(usedTeamNames);
  usedTeamNames.add(homeT.name);
  usedTeamNames.add(awayT.name);

  const match = {
    id: crypto.randomUUID(),
    homeTeam: makeTeam(homeT),
    awayTeam: makeTeam(awayT),
    homeScore: 0,
    awayScore: 0,
    minute,
    status,
    startTime: new Date(Date.now() + kickoffInSeconds * 1000).toISOString(),
    events: [],
    statistics: emptyStats(),
    _kickoffAt: Date.now() + kickoffInSeconds * 1000,
    _halftimeResumeAt: null,
    _respawnAt: null,
  };
  return match;
}

const matches = [
  createMatch({ status: "FIRST_HALF", minute: 12, kickoffInSeconds: -12 }),
  createMatch({ status: "SECOND_HALF", minute: 61, kickoffInSeconds: -61 }),
  createMatch({ status: "NOT_STARTED", kickoffInSeconds: 20 }),
  createMatch({ status: "FULL_TIME", minute: 90, kickoffInSeconds: -5400 }),
];
// Give the FULL_TIME seed match a plausible final score/events so the detail view isn't empty.
matches[3].homeScore = 2;
matches[3].awayScore = 2;

function findMatch(id) {
  return matches.find((m) => m.id === id);
}

function serializeSummary(m) {
  const { id, homeTeam, awayTeam, homeScore, awayScore, minute, status, startTime } = m;
  return { id, homeTeam, awayTeam, homeScore, awayScore, minute, status, startTime };
}

function serializeDetail(m) {
  return { ...serializeSummary(m), events: m.events, statistics: m.statistics };
}

// ---------------------------------------------------------------------------
// REST endpoints
// ---------------------------------------------------------------------------

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/matches", (_req, res) => {
  res.json({ success: true, data: { matches: matches.map(serializeSummary), total: matches.length } });
});

app.get("/api/matches/live", (_req, res) => {
  const live = matches.filter((m) => LIVE_STATUSES.has(m.status));
  res.json({ success: true, data: { matches: live.map(serializeSummary), total: live.length } });
});

app.get("/api/matches/:id", (req, res) => {
  const match = findMatch(req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Match not found" } });
  }
  res.json({ success: true, data: serializeDetail(match) });
});

// ---------------------------------------------------------------------------
// Match simulation
// ---------------------------------------------------------------------------

function emitToMatch(matchId, event, payload) {
  io.to(`match:${matchId}`).emit(event, payload);
}

function addEvent(match, type, team, player, extra = {}) {
  const event = {
    id: crypto.randomUUID(),
    type,
    minute: match.minute,
    team,
    player,
    description: describeEvent(type, team, match, player, extra),
    timestamp: new Date().toISOString(),
    ...extra,
  };
  match.events.push(event);
  emitToMatch(match.id, "match_event", { matchId: match.id, ...event });
  return event;
}

function describeEvent(type, team, match, player, extra) {
  const teamName = team === "home" ? match.homeTeam.name : match.awayTeam.name;
  switch (type) {
    case "GOAL":
      return `GOAL! ${player} scores for ${teamName}!`;
    case "YELLOW_CARD":
      return `Yellow card shown to ${player}`;
    case "RED_CARD":
      return `Red card shown to ${player}`;
    case "SUBSTITUTION":
      return `${player} comes on for ${teamName}`;
    case "FOUL":
      return `Foul committed by ${player}`;
    case "SHOT":
      return `${player} takes a shot${extra.onTarget ? " — on target!" : ""}`;
    default:
      return `${type} — ${teamName}`;
  }
}

function maybeGenerateEvent(match) {
  const roll = Math.random();
  const team = Math.random() < 0.5 ? "home" : "away";
  const player = randomFrom(PLAYER_POOL);

  if (roll < 0.015) {
    // Goal
    addEvent(match, "GOAL", team, player, {
      assistPlayer: Math.random() < 0.6 ? randomFrom(PLAYER_POOL) : undefined,
    });
    if (team === "home") match.homeScore += 1;
    else match.awayScore += 1;
    match.statistics.shotsOnTarget[team] += 1;
    match.statistics.shots[team] += 1;
    emitToMatch(match.id, "score_update", { matchId: match.id, homeScore: match.homeScore, awayScore: match.awayScore });
  } else if (roll < 0.03) {
    addEvent(match, "YELLOW_CARD", team, player);
    match.statistics.yellowCards[team] += 1;
  } else if (roll < 0.032) {
    addEvent(match, "RED_CARD", team, player);
    match.statistics.redCards[team] += 1;
  } else if (roll < 0.05) {
    addEvent(match, "SUBSTITUTION", team, player);
  } else if (roll < 0.12) {
    addEvent(match, "FOUL", team, player);
    match.statistics.fouls[team] += 1;
  } else if (roll < 0.22) {
    const onTarget = Math.random() < 0.4;
    addEvent(match, "SHOT", team, player, { onTarget });
    match.statistics.shots[team] += 1;
    if (onTarget) match.statistics.shotsOnTarget[team] += 1;
  } else if (roll < 0.26) {
    match.statistics.corners[team] += 1;
  }
}

function nudgePossession(match) {
  const drift = Math.round((Math.random() - 0.5) * 4);
  match.statistics.possession.home = Math.min(70, Math.max(30, match.statistics.possession.home + drift));
  match.statistics.possession.away = 100 - match.statistics.possession.home;
}

function respawnMatch(oldMatch) {
  const idx = matches.indexOf(oldMatch);
  if (idx === -1) return;
  matches[idx] = createMatch({ status: "NOT_STARTED", kickoffInSeconds: 15 });
}

let tickCount = 0;
setInterval(() => {
  tickCount += 1;
  const now = Date.now();

  for (const match of matches) {
    if (match.status === "NOT_STARTED") {
      if (now >= match._kickoffAt) {
        match.status = "FIRST_HALF";
        match.minute = 0;
        emitToMatch(match.id, "status_change", { matchId: match.id, status: match.status, minute: match.minute });
      }
      continue;
    }

    if (match.status === "HALF_TIME") {
      if (match._halftimeResumeAt && now >= match._halftimeResumeAt) {
        match.status = "SECOND_HALF";
        emitToMatch(match.id, "status_change", { matchId: match.id, status: match.status, minute: match.minute });
      }
      continue;
    }

    if (match.status === "FULL_TIME") {
      if (match._respawnAt && now >= match._respawnAt) respawnMatch(match);
      continue;
    }

    // FIRST_HALF or SECOND_HALF: advance the clock.
    match.minute += 1;
    maybeGenerateEvent(match);
    nudgePossession(match);

    if (match.status === "FIRST_HALF" && match.minute >= 45) {
      match.status = "HALF_TIME";
      match._halftimeResumeAt = now + 5000; // brief real-time break
      emitToMatch(match.id, "status_change", { matchId: match.id, status: match.status, minute: match.minute });
    } else if (match.status === "SECOND_HALF" && match.minute >= 90) {
      match.status = "FULL_TIME";
      match._respawnAt = now + 15000;
      emitToMatch(match.id, "status_change", { matchId: match.id, status: match.status, minute: match.minute });
    }

    // Stats update every 3 ticks to mimic a realistic (not-per-second) cadence.
    if (tickCount % 3 === 0) {
      emitToMatch(match.id, "stats_update", { matchId: match.id, statistics: match.statistics });
    }
  }
}, TICK_MS);

// ---------------------------------------------------------------------------
// Socket.IO: subscriptions + chat
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 5;
const MESSAGE_MAX_LENGTH = 500;

io.on("connection", (socket) => {
  socket.data.messageTimestamps = [];
  socket.data.chatRooms = new Map(); // matchId -> {userId, username}

  socket.on("subscribe_match", ({ matchId }) => {
    if (matchId) socket.join(`match:${matchId}`);
  });

  socket.on("unsubscribe_match", ({ matchId }) => {
    if (matchId) socket.leave(`match:${matchId}`);
  });

  socket.on("join_chat", ({ matchId, userId, username }) => {
    if (!matchId || !userId || !username) return;
    socket.join(`chat:${matchId}`);
    socket.data.chatRooms.set(matchId, { userId, username });
    socket.to(`chat:${matchId}`).emit("user_joined", { matchId, userId, username });
  });

  socket.on("leave_chat", ({ matchId, userId }) => {
    if (!matchId) return;
    const info = socket.data.chatRooms.get(matchId);
    socket.leave(`chat:${matchId}`);
    socket.data.chatRooms.delete(matchId);
    socket.to(`chat:${matchId}`).emit("user_left", { matchId, userId, username: info?.username });
  });

  socket.on("send_message", ({ matchId, userId, username, message }) => {
    if (!matchId || !userId || !username || typeof message !== "string") return;

    if (message.length > MESSAGE_MAX_LENGTH) {
      socket.emit("error", { code: "MESSAGE_TOO_LONG", message: `Messages are limited to ${MESSAGE_MAX_LENGTH} characters.` });
      return;
    }

    const now = Date.now();
    socket.data.messageTimestamps = socket.data.messageTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (socket.data.messageTimestamps.length >= RATE_LIMIT_MAX) {
      socket.emit("error", { code: "RATE_LIMITED", message: "You're sending messages too fast. Slow down." });
      return;
    }
    socket.data.messageTimestamps.push(now);

    io.to(`chat:${matchId}`).emit("chat_message", {
      id: crypto.randomUUID(),
      matchId,
      userId,
      username,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("typing_start", ({ matchId, userId, username }) => {
    if (!matchId) return;
    socket.to(`chat:${matchId}`).emit("typing_indicator", { matchId, userId, username, isTyping: true });
  });

  socket.on("typing_stop", ({ matchId, userId }) => {
    if (!matchId) return;
    socket.to(`chat:${matchId}`).emit("typing_indicator", { matchId, userId, isTyping: false });
  });

  socket.on("disconnect", () => {
    for (const [matchId, info] of socket.data.chatRooms) {
      socket.to(`chat:${matchId}`).emit("user_left", { matchId, userId: info.userId, username: info.username });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mock ProFootball API + Socket.IO listening on http://localhost:${PORT}`);
  console.log(`Point NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_WS_URL at this host to use it.`);
});
