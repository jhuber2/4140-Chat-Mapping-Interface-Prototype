# Chat Mapping Interface

Chat Mapping Interface is a frontend HCI prototype for exploring the same team conversation in two synchronized ways:

- `Chat View`: the chronological conversation
- `Map View`: a topic map / branching structure of that same conversation

This is intentionally a Wizard-of-Oz prototype. The system is designed for interactive demos, not production deployment.

## Project At A Glance

- Frontend-first React prototype
- Seeded conversation and topic-map data
- Local state drives most behavior
- Optional WebSocket relay for live multi-device demos
- Includes a facilitator view for manual intervention during demos
- No database, production auth, AI backend, or NLP service

## Requirements

- Node.js installed
- npm installed
- A modern desktop browser
- Optional for realtime demos: access to two devices or browser windows, plus a reachable WebSocket host

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the frontend

```bash
npm run dev
```

### 3. Open the app

Vite will print a local URL such as:

```text
http://localhost:5173
```

Open that URL in your browser.

### 4. Sign in with a demo account

- Username: `jack`
- Username: `boyd`
- Username: `emmanuel`
- Username: `graham`
- Password for all demo accounts: `cpsc4140`

After sign-in, the main prototype loads at `/app`.

## What This Project Is

This repository contains a course prototype for comparing two synchronized representations of the same team discussion:

- `Chat View` shows the full conversation as a standard message thread.
- `Map View` shows the conversation as a topic structure with branches, supporting messages, and detail panels.
- `Facilitator` view supports Wizard-of-Oz control during demos by letting a human manually assign messages to topics or create new topics.

The goal is to demonstrate an interface concept, not to provide a production-ready collaboration system.

## Technologies Used

- React functional components
- TypeScript
- Vite
- React Router
- Local component state and reducer-driven workspace logic

## Available Commands

Run these from the repository root:

- `npm install`: install project dependencies
- `npm run dev`: start the Vite development server
- `npm run ws:server`: start the optional WebSocket relay on port `8080`
- `npm run build`: create a production build in `dist/`
- `npm run build:gh-pages`: build using the GitHub Pages mode and generate the fallback file

If you are on Linux and want short aliases, this repo also includes [Makefile]

- `make install`
- `make dev`
- `make ws`
- `make build`

The Makefile is only a convenience wrapper around the npm commands above.

## How To Run

For most people, these are the only commands that matter:

```bash
npm install
npm run dev
```

Then open the local Vite URL, sign in with one of the demo accounts, and use the interface.

If you also want realtime sync between devices, run the relay in a second terminal:

```bash
npm run ws:server
```

## Realtime Demo Setup

Realtime sync is optional. Without it, the prototype still works locally with seeded data and local state.

The relay is:

- lightweight
- in-memory only
- room-based
- currently hardcoded to the room ID `demo-room`

### Local realtime setup

1. Start the WebSocket relay:

```bash
npm run ws:server
```

2. Create or update `.env.local` in the repo root:

```env
VITE_WS_URL=ws://localhost:8080
```

3. Start the frontend:

```bash
npm run dev
```

4. Open the app in two browser windows or on two devices using the same frontend build.

5. Sign in on each client. Actions such as new messages, manual assignments, topic creation, and workspace reset will sync through the relay.

### Off-machine or multi-device setup

If the relay is running on another machine, point `VITE_WS_URL` at that host instead:

```env
VITE_WS_URL=ws://<SERVER_IP>:8080
```

If you expose the relay through a tunnel such as ngrok, use a secure WebSocket URL:

```env
VITE_WS_URL=wss://<your-domain>
```

## Prototype Limitations

- This is not a production chat system.
- Authentication is seeded local demo auth, not a real auth service.
- There is no database or persistent backend storage.
- Realtime state is in memory only and is lost when the relay restarts.
- Topic routing is scripted local logic, not AI or NLP classification.
- The relay currently uses a single hardcoded room ID: `demo-room`.

## Files And Commands That Matter Most

If you are scanning the repo quickly, start here:

- `npm install`
- `npm run dev`
- `npm run ws:server` for optional realtime demos
