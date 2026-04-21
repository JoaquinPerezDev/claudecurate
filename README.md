# ClaudeCurate

A lightweight task tracking app that automatically marks your tasks complete when Claude finishes related work.

Create tasks with keywords, connect your Claude setup in a few steps, and let ClaudeCurate handle the rest — tasks auto-complete in the background as Claude works through them.

---

## Features

- **Task management** — create tasks with descriptions, status tracking, and subtasks
- **Subtask checklists** — break tasks into steps; parent task auto-completes when all subtasks are done
- **Claude keywords** — tag tasks with keywords so Claude sessions can match and complete them automatically
- **Auto-completion** — integrates with Claude Code CLI (via Stop hooks) and Claude Desktop (via MCP server)
- **Manual tracking** — works as a standalone task tracker even without Claude integration
- **Responsive design** — mobile-first UI, works in your phone browser
- **30-second polling** — webhook-triggered completions surface automatically without a page refresh

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Material UI v5, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) |
| Auth | JWT (email + password) |
| Testing | Jest, Supertest, React Testing Library |
| Claude integration | Claude Code Stop hooks, MCP server |

---

## Project Structure

```
claudecurate/
├── client/                  # React frontend
│   └── src/
│       ├── api/             # Axios instance
│       ├── context/         # Auth context
│       ├── hooks/           # useTasks (30s poll)
│       ├── pages/           # Login, Register, Dashboard, Onboarding, Profile
│       ├── components/      # Navbar, TaskCard, TaskModal, StatsBar
│       └── __tests__/
├── server/                  # Express backend
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Auth, tasks, webhook
│   ├── middleware/          # JWT auth, error handler
│   ├── models/              # User, Task (with subtasks)
│   ├── routes/              # Auth, tasks, webhook routes
│   ├── utils/               # matchTask fuzzy matching
│   ├── mcp/                 # MCP server for Claude Desktop
│   └── __tests__/
└── hooks/
    └── claude-hook.sh       # Claude Code Stop hook script
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/claudecurate.git
cd claudecurate
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure the server

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in your values:

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/claudecurate?retryWrites=true&w=majority
JWT_SECRET=<generate a long random string>
CLIENT_URL=http://localhost:3000
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the app

Open two terminals:

```bash
# Terminal 1 — backend
npm run server:dev

# Terminal 2 — frontend
npm run client
```

The app will be at `http://localhost:3000`.

---

## Running Tests

```bash
# Backend tests (28 tests)
npm run server:test

# Frontend tests (17 tests)
npm run client:test

# Both
npm test
```

---

## Claude Integration

After registering, the onboarding wizard walks you through connecting Claude. There are two methods depending on how you use Claude.

### Method A — Claude Code (CLI)

For users of the `claude` terminal command.

**1. Download and save the hook script**

Your personal webhook token is shown in the app during onboarding (also at Profile → Claude Integration). Save the pre-filled script to your home folder:

```bash
# The script is available in hooks/claude-hook.sh
# Replace YOUR_TOKEN and YOUR_API_URL, then:
cp hooks/claude-hook.sh ~/claude-hook.sh
chmod +x ~/claude-hook.sh
```

**2. Register the hook with Claude Code**

Add this to `~/.claude/settings.json` (create the file if it doesn't exist):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/claude-hook.sh"
          }
        ]
      }
    ]
  }
}
```

**3. Test it**

```bash
echo '{"description":"test task completed"}' | bash ~/claude-hook.sh
```

Create a task with a matching keyword first, then check your dashboard.

---

### Method B — Claude Desktop app

For users of the Claude Desktop GUI.

**1. Add the MCP server to your Claude Desktop config**

Find the config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following (your token is shown in the app during onboarding):

```json
{
  "mcpServers": {
    "claudecurate": {
      "command": "npx",
      "args": ["-y", "claudecurate-mcp"],
      "env": {
        "WEBHOOK_TOKEN": "YOUR_WEBHOOK_TOKEN",
        "API_URL": "https://your-deployed-api.com"
      }
    }
  }
}
```

**2. Restart Claude Desktop**

Fully quit and reopen Claude Desktop.

**3. Add a custom instruction**

In Claude Desktop → **Settings → Custom Instructions**, paste:

> At the end of every conversation, call the ClaudeCurate `log_session` tool with a one-sentence description of what we accomplished.

Claude will now automatically call ClaudeCurate at the end of each conversation (~95% reliability).

---

### How matching works

When a Claude session ends, ClaudeCurate receives a description of what was accomplished and scores it against your tasks:

1. **Subtask match** — checks if any pending subtask title overlaps with the description (threshold: 50% word match). If matched, the subtask is completed. If all subtasks are now done, the parent auto-completes.
2. **Task match** — scores each non-complete task using keyword hits (weight 1.0) and title word overlap (weight 0.3). The highest-scoring task above a 0.4 threshold is completed.

**Tip:** Add specific Claude keywords to your tasks to improve matching accuracy. Example: a task titled "User authentication" with keywords `["login", "JWT", "bcrypt"]` will match sessions where Claude worked on login or auth code.

---

## Deployment

### Backend — Railway

1. Push to GitHub
2. Create a new project on [Railway](https://railway.app) → Deploy from GitHub repo
3. Set **Root Directory** to `server`
4. Add environment variables in Railway's Variables tab:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel URL, added after frontend deploy)
5. Generate a public domain under **Settings → Networking**

### Frontend — Vercel

1. Create a new project on [Vercel](https://vercel.com) → Import from GitHub
2. Set **Root Directory** to `client`
3. Add environment variable:
   - `REACT_APP_API_URL` = your Railway server URL
4. Deploy

### Database — MongoDB Atlas

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user under **Security → Database Access**
3. Allow all IPs under **Security → Network Access** (`0.0.0.0/0`) for hosted deployments
4. Copy the connection string into your `MONGO_URI` environment variable

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | server | Port the Express server listens on |
| `MONGO_URI` | server | MongoDB Atlas connection string |
| `JWT_SECRET` | server | Secret for signing JWTs — use a long random string in production |
| `CLIENT_URL` | server | Frontend origin, used for CORS |
| `REACT_APP_API_URL` | client | Backend URL (empty = use proxy in local dev) |

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register, returns JWT + webhookToken |
| POST | `/api/auth/login` | — | Login, returns JWT + webhookToken |
| POST | `/api/auth/regenerate-token` | JWT | Generate a new webhookToken |
| GET | `/api/tasks` | JWT | List all tasks |
| POST | `/api/tasks` | JWT | Create a task |
| PUT | `/api/tasks/:id` | JWT | Update a task |
| PATCH | `/api/tasks/:id/subtasks/:subtaskId` | JWT | Toggle a subtask complete/pending |
| DELETE | `/api/tasks/:id` | JWT | Delete a task |
| POST | `/api/webhook/claude-hook` | webhookToken | Auto-complete matched task from Claude session |

---

## Security Notes

- `.env` files are excluded from version control via `.gitignore` — never commit real credentials
- Use `.env.example` as a template when setting up a new environment
- Webhook tokens are UUIDs — regenerate yours at any time from Profile → Claude Integration
- Regenerating your token invalidates your existing hook script and MCP config — update both after regenerating

---

## License

MIT
