# Chat Mapping Interface

Chat Mapping Interface is a frontend HCI prototype for viewing the same team conversation in two synchronized forms:

- `Chat View`: a chronological message thread
- `Map View`: a topic map showing how the conversation branches and relates

This project is intentionally a Wizard-of-Oz prototype. It is built for demos, walkthroughs, and evaluation of the interaction concept, not for production deployment.

## Start Here

The normal startup path for this project is:

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal, usually:

```text
http://localhost:5173
```

Sign in with one of the seeded demo accounts:

- Username: `jack`
- Username: `boyd`
- Username: `emmanuel`
- Username: `graham`
- Password for all demo accounts: `cpsc4140`

After login, the protected prototype loads at `/app`.

## Basic Setup In This Workspace

### Requirements

- Node.js
- npm
- A modern browser

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

This launches the Vite development server for the React frontend.

### Optional: start realtime sync

If you want two browser windows or two devices to stay in sync during a demo or Wizard-of-Oz testing, run the WebSocket relay in a second terminal:

```bash
npm run ws:server
```

The local workspace is already configured to use:

```env
VITE_WS_URL=ws://localhost:8080
```

That value lives in `.env.local`. If the relay is not running, the frontend still works locally without realtime sync.


## Project Overview

This repository contains a React + TypeScript prototype for comparing two representations of the same group discussion:

- `Chat View` shows the conversation as a familiar chat timeline.
- `Map View` shows the same conversation as a structured topic tree.
- `Facilitator` view supports Wizard-of-Oz intervention during demos.

The central idea is that a team discussion can be explored either as a linear message history or as a map of topics, subtopics, and supporting messages. The prototype lets a participant move between those views while keeping them tied to the same underlying workspace state.

## How The App Starts Up

From the codebase perspective, startup works like this:

1. Vite serves `index.html`, which loads `src/main.tsx`.
2. `src/main.tsx` mounts the React application.
3. `src/app/App.tsx` wraps the app in:
   - `ThemeProvider` for light/dark theme support
   - `AuthProvider` for seeded local session state
   - `BrowserRouter` for route handling
4. The router exposes:
   - `/` for the landing page
   - `/login` for sign-in
   - `/app` for the protected prototype
5. After login, `PrototypeApp` loads the seeded workspace data and manages the main app state.

The application is frontend-first. Most behavior comes from local React state and reducer logic, with optional realtime synchronization layered on top.

## Main Views

### Landing Page

The landing page is a lightweight entry point with branding and a sign-in button. It does not contain application data itself.

### Login

Login is local and seeded for demo use. There is no production authentication system, user directory, or backend identity provider. Successful login writes a local session and unlocks the protected `/app` route.

### Chat View

Chat View presents the conversation as a standard message thread. Users can:

- read the seeded discussion history
- send new messages
- see sender names and timestamps
- jump back to a specific message when navigating from the map detail panel

When a new message is sent, the app runs simple scripted routing logic to choose a topic node. This is not AI classification. It is keyword-based demo logic designed to support the prototype.

### Map View

Map View visualizes the same workspace as a hierarchy of topics. Users can:

- expand and collapse parts of the topic tree
- select nodes to inspect them
- search for nodes and navigate to results
- open supporting messages tied to a node
- jump from a node's detail panel back into Chat View

This is the core interaction concept of the project: the same conversation can be explored semantically through topic structure, not only chronologically through chat.

### Facilitator View

The Facilitator tab is the Wizard-of-Oz control surface.

Its purpose is to let a human operator actively manage the prototype during a demo or study session. Instead of relying on a real backend intelligence layer, the facilitator can keep the topic map coherent by stepping in manually.

The facilitator can:

- review all incoming messages
- see whether a message was auto-routed, manually assigned, or left unassigned
- manually assign or reassign a message to a topic
- create a new topic under an existing parent
- delete a topic
- review recent assignment activity
- reset the workspace back to the seeded state

This tab is important because it makes the prototype workable without requiring a production-quality automatic topic classification system. In a demo, the operator can quietly correct or guide the conversation structure behind the scenes.

## Realtime And WebSockets

Realtime sync is optional.

Without the WebSocket relay, the prototype still works entirely in a single browser session using local seeded state.

With the relay enabled, multiple clients can share the same in-memory workspace during a demo. This is mainly useful for Wizard-of-Oz testing and facilitated multi-device sessions. The relay:

- runs on port `8080`
- uses WebSockets through the `ws` package
- keeps room state in memory only
- broadcasts workspace events to connected clients
- currently uses a hardcoded room ID: `demo-room`

The frontend publishes and listens for workspace events such as:

- `chat.message.created`
- `message.assigned`
- `node.created`
- `node.deleted`
- `workspace.reset`

The relay does not persist data. If the relay restarts, the shared session state is lost.

### Local realtime setup

1. Start the relay:

```bash
npm run ws:server
```

2. Confirm `.env.local` points at the relay:

```env
VITE_WS_URL=ws://localhost:8080
```

3. Start the frontend:

```bash
npm run dev
```

4. Open the app in two browser windows or on two devices.

5. Log in on each client and interact with the shared workspace.

### Off-machine realtime setup

If the relay runs on another machine, update `.env.local` to point to that host:

```env
VITE_WS_URL=ws://<SERVER_IP>:8080
```

If you expose the relay through a secure tunnel, use `wss://`.

## What This Project Is Not

This prototype does not include:

- a production backend
- a database
- persistent storage
- a real authentication service
- AI/NLP-based topic understanding
- production-grade collaboration infrastructure

It is a controlled prototype focused on interface concept validation.

## Technology Summary

The codebase is built around:

- React
- TypeScript
- Vite
- React Router
- local reducer-driven workspace state
- optional WebSocket-based realtime sync
- Tailwind-based styling and custom CSS theming

## Commands That Matter Most

For most development work, these are the commands that matter:

```bash
npm install
npm run dev
```

If you want realtime demo sync, also run:

```bash
npm run ws:server
```

## About The Makefile

The Makefile is only a convenience wrapper around the npm commands:

- `make install`
- `make dev`
- `make ws`
- `make build`

It is not required to run the project.

This is especially relevant on Clemson School of Computing Linux machines, where `npm` may not be available by default. In that environment, the Makefile can be a useful shorthand if the surrounding toolchain is already set up, but the project itself is fundamentally driven by the npm commands listed above.
