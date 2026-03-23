# Chat Mapping Interface
# NEW BRANCH CHECK

Chat Mapping Interface is a front-end HCI prototype for visualizing a team conversation in two synchronized ways:
- `Chat View`: chronological team discussion
- `Map View`: branching topic map of the same conversation

This is intentionally a Wizard-of-Oz prototype.

## Project Scope

This project is intentionally **frontend-only**:
- No backend
- No database
- No authentication
- No external AI APIs
- No NLP service

All behavior is implemented with:
- React functional components
- Local component/state logic
- Mock JSON-style seed data

## Core Prototype Behavior

### 1) Chat and Map Are Linked
- Seeded team messages are shown in `Chat View`
- Each message is assigned to one or more map nodes (`nodeIds`)
- `Map View` shows the same conversation as a topic tree
- Selecting a map node opens details and supporting evidence

### 2) Auto-Routing (Scripted)
When a user sends a message, a local keyword matcher routes it to a topic node.
Examples:
- auth/token/login/401/logout -> authentication branch
- api/endpoint/request/response -> API branch
- ui/frontend/layout/button -> UI branch
- deploy/docker/env/postgres -> deployment branch
- meeting/sync/schedule -> coordination branch

Messages that do not strongly match are routed to `General Conversation` or handled manually in operator mode.

### 3) Wizard-of-Oz Operator Mode
Operator mode is for live demo control when participant input is unexpected.

How to open it:
- Press `Ctrl + Shift + O`
- or click the subtle `Ops` floating button

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

2. Start development server
```bash
npm run dev
```

3. Build for production (optional)
```bash
npm run build
```

## Suggested Demo Flow

1. Start in `Map View` and show major topic branches
2. Switch to `Chat View` to show chronological team context
3. Send a new message and show auto-routing into the map
4. Open `Ops` mode and manually reassign a message to demonstrate Wizard-of-Oz control
5. Open `View Supporting Messages` for a selected node to show evidence traceability
