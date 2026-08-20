# Live Match Center

Live match dashboard with real-time score updates, event timelines, statistics, and per-match chat — built against the ProFootball backend API.

- **Deployed app:** _add URL after deploying_
- **Backend API:** https://profootball.srv883830.hstgr.cloud

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `socket.io-client` for real-time updates and chat

## Getting Started

```bash
npm install
cp .env.example .env.local   # points at the production API
npm run dev
```

Open http://localhost:3000.

## Folder Structure

```
src/
  app/
    layout.tsx              # root layout, wraps app in SocketProvider
    page.tsx                # dashboard (server component, initial fetch)
    loading.tsx / error.tsx
    matches/[id]/
      page.tsx              # match detail (server component, initial fetch)
      loading.tsx / not-found.tsx
  components/
    dashboard/               # MatchCard, MatchList, StatusBadge
    match/                   # ScoreHeader, Timeline, StatsPanel, MatchDetailView
    chat/                    # ChatPanel (username gate + chat room)
    ui/                      # small shared UI (ConnectionBadge)
  contexts/
    SocketContext.tsx        # single app-wide Socket.IO connection + status
  hooks/
    useMatches.ts             # dashboard list: subscriptions + poll fallback
    useMatchDetail.ts         # single match: subscription + reconnect resync
    useChat.ts                 # chat room join/leave, messages, typing
    useLocalUser.ts            # localStorage-backed chat identity
  lib/
    api.ts                    # typed REST client
  types/
    match.ts / chat.ts / socket.ts   # types mirroring the backend contract
```

## Approach

- **Server-rendered first paint, client-driven realtime after.** Both the
  dashboard and match detail pages fetch their initial data over REST in a
  Server Component (`force-dynamic`, `cache: "no-store"`, since scores must
  never be served stale). The fetched data is handed to a client component
  that takes over via Socket.IO for live updates — fast first paint, no
  loading spinner for the initial view, no flash of empty state.
- **One socket, many subscriptions.** `SocketProvider` in the root layout
  opens a single Socket.IO connection for the whole app. Individual hooks
  (`useMatches`, `useMatchDetail`, `useChat`) layer `subscribe_match` /
  `join_chat` lifecycles on top and clean up (`unsubscribe_match` /
  `leave_chat`) on unmount or when the match/room changes — this satisfies
  the "connections should be properly cleaned up when leaving a view"
  requirement.
- **Connection status is surfaced, not hidden.** `SocketContext` tracks
  `connecting` / `connected` / `reconnecting` / `disconnected` from the
  underlying `socket.io` manager events and renders it as a badge in the
  header at all times. Socket creation and teardown live in a single
  `useEffect` (not a `useMemo` + a separate cleanup effect) — that split
  was tried first and, under React 18 Strict Mode's dev-only
  mount→cleanup→mount double-invoke, closed the shared socket a beat after
  creating it, leaving `status` stuck on "Connecting" even though the
  transport had silently reconnected underneath. Keeping create/destroy in
  one effect makes the double-invoke closes-and-fully-recreates one
  coherent socket instead of orphaning half of it — caught by actually
  screenshotting the running app, not just from reading the code.
- **Reconnection recovers state, not just the pipe.** `socket.io-client`'s
  built-in reconnection (infinite attempts, capped backoff) restores the
  transport, but a reconnected socket alone doesn't tell you what happened
  while you were offline. On the match detail page, a reconnect triggers a
  full REST refetch of the match (score, events, stats) to resync — cheaper
  and more correct than trying to replay missed socket events.
- **Dashboard list freshness via REST poll + push.** The API has no
  "match created" socket event, and the assessment notes finished matches
  are replaced by new ones automatically. Score/status updates for matches
  already on screen come from the socket; a 30s REST poll is the fallback
  that notices matches starting or disappearing from the list.
- **Chat identity is just a `localStorage` username + generated `userId`**
  (via `crypto.randomUUID()`), no auth, per the assessment's suggestion.
  Typing indicators debounce a `typing_stop` emit 2s after the last
  keystroke rather than firing on every character.

## Trade-offs / Known Limitations

- **Verified end-to-end against the real production API**
  (`profootball.srv883830.hstgr.cloud`), which was intermittently
  unreachable earlier in development — REST responses, the socket event
  contract, dashboard live scores, match detail timeline/stats, and chat
  were all confirmed directly against it, including with a raw
  `socket.io-client` script outside the app to check wire compatibility.
- **Pinned to Next.js 14.2** rather than the `create-next-app@latest`
  default (which resolved to Next 16 at scaffold time). The spec asks for
  "14+"; 14 is the best-documented, most stable target and avoids betting
  the assessment on an unreleased-to-me API surface.
- **No optimistic chat UI.** Sent messages appear only once the server
  echoes `chat_message` back, so there's a brief round-trip delay instead
  of an instant local render — simpler and avoids reconciling
  optimistic-vs-real message IDs, at the cost of perceived latency.
- **No message/event de-duplication beyond a best-effort key.** The
  backend doesn't guarantee unique `id`s on socket payloads for chat
  messages or match events, so de-dupe falls back to a composite key
  (type/minute/player/timestamp for events; userId/timestamp for chat).
  Vanishingly unlikely to collide, but not a real guarantee.
- **Dashboard poll interval (30s) is a fixed trade-off** between staying
  current when matches start/finish and not hammering the API. Could be
  replaced by a server-sent "match list changed" event if the backend
  added one.
- **No test suite.** Given the scope and time box, correctness was
  validated by exercising the live API/socket directly rather than writing
  unit/integration tests.
- **Styling is minimal/utility-first (Tailwind), not a design system.**
  Prioritized correctness of the real-time behavior over visual polish.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base URL |
| `NEXT_PUBLIC_WS_URL` | Socket.IO server URL |

Both are public (`NEXT_PUBLIC_*`) since they're needed in the browser for the client-side socket connection and are not secrets.
