# Chat Mapping Interface
# NEW BRANCH CHECK

Chat Mapping Interface is a front-end HCI prototype for visualizing a team conversation in two synchronized ways:
- `Chat View`: chronological team discussion
- `Map View`: branching topic map of the same conversation

This is intentionally a Wizard-of-Oz prototype.

## Project Scope

This project is intentionally **frontend-first**:
- No database
- No production authentication service
- No external AI APIs
- No NLP service
- Optional lightweight websocket relay for live multi-device demos

All behavior is implemented with:
- React functional components
- Local component/state logic with optional realtime event relay
- Mock JSON-style seed data

## Core Prototype Behavior

### 1) Chat and Map Are Linked
- Seeded team messages are shown in `Chat View`
- Each message is assigned to one or more map nodes (`nodeIds`)
- `Map View` shows the same conversation as a topic tree
- Selecting a map node opens details and supporting evidence

### 2) Auto-Routing (Scripted)
When a user sends a message, a local keyword matcher routes it to a project-planning topic node.

Messages that do not strongly match are routed to `General Conversation` or handled manually in operator mode.

### 3) Wizard-of-Oz Operator View
Operator View is for live demo control when participant input is unexpected.

What operators can do:
- Review recent incoming messages
- Review unassigned messages
- Manually assign a message to an existing node
- Create a new node under a chosen parent

This keeps the demo robust without requiring real AI classification.

## Main Views

### Chat View
- Long, realistic team conversation history
- Sender, timestamp, and message text
- Input bar for new local messages
- New messages are appended and routed into the map model

### Map View
- Root-to-right hierarchical topic map
- Expandable branch behavior
- Selected-path highlighting
- Pan/zoom map workspace with reset controls
- Right detail panel for summary, metadata, and decisions
- Supporting messages modal for node evidence

## Data Model Notes

### Message shape
Messages use fields such as:
- `id`
- `sender`
- `text`
- `timestamp`
- `nodeIds`
- `autoMapped`
- `assignedManually`

### Node shape
Nodes use fields such as:
- `id`
- `title`
- `parentId`
- `summary`
- `metadata`
- `decisions`
- `supportingMessageIds`
- `childrenIds`
- `depth`

Node metadata (message counts, first discussed, last active) is derived from assigned messages so chat/map stay consistent.

## Running the Code

From this project directory:

1. Install dependencies
```bash
npm i
```

2. Start frontend development server
```bash
npm run dev
```

3. Start websocket relay server (for realtime collaboration demos)
```bash
npm run ws:server
```

4. Build for production (optional)
```bash
npm run build
```

## Realtime Demo Setup (Two Devices)

The realtime layer is room-based (`demo-room`) and keeps in-memory shared state only.

### 1) Configure websocket URL for frontend
Create `.env.local`:
```env
VITE_WS_URL=ws://<SERVER_IP>:8080
```

For ngrok:
```env
VITE_WS_URL=wss://<your-ngrok-domain>.ngrok-free.dev
```

### 2) Run relay server on host machine
```bash
npm run ws:server
```

### 3) Expose relay with ngrok (if off-LAN)
```bash
ngrok http 8080
```

### 4) Run frontend on each device
- Open the app on Device A and Device B
- Sign in and enter `/app`
- Both clients will join the same shared room and sync:
  - message creation
  - message assignment
  - node creation
  - workspace reset

## Suggested Demo Flow

1. Start in `Map View` and show major topic branches
2. Switch to `Chat View` to show chronological team context
3. Send a new message and show auto-routing into the map
4. Open `Operator View` and manually reassign a message to demonstrate Wizard-of-Oz control
5. Open `View Supporting Messages` for a selected node to show evidence traceability
