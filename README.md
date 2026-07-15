# Major Project 2 Backend

A Node.js/Express REST API for managing sales leads, with reporting endpoints. Built with MongoDB (Mongoose).

## Tech Stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 5
- **ODM:** Mongoose 9
- **Database:** MongoDB Atlas

## Getting Started

```bash
cp .env .env.local   # or just configure .env
# .env needs: dbConnectionString=mongodb+srv://...
npm install
npm run dev           # requires nodemon, or node index.js
```

Server starts on `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **Leads** | | |
| `POST` | `/leads` | Create a lead |
| `GET` | `/leads` | List/filter leads by `?status=`, `?source=`, `?salesAgent=`, `?tags=` |
| `PUT` | `/leads/:id` | Update a lead |
| `DELETE` | `/leads/:id` | Delete a lead |
| **Comments** | | |
| `POST` | `/leads/:id/comments` | Add comment to a lead |
| `GET` | `/leads/:id/comments` | Get comments for a lead |
| **Tags** | | |
| `POST` | `/tags` | Create a tag |
| `GET` | `/tags` | List all tags |
| **Sales Agents** | | |
| `POST` | `/agents` | Create a sales agent |
| `GET` | `/agents` | List all agents |
| **Reports** | | |
| `GET` | `/report/last-week` | Leads closed in the last 7 days |
| `GET` | `/report/pipeline` | Pipeline leads grouped by status (excl. Closed) |
| `GET` | `/report/closed-by-agent` | Closed leads grouped by sales agent with agent details |

## Data Models

- **Lead** — `name`, `source`, `salesAgent` (ref), `status` (New/Contacted/Qualified/Proposal Sent/Closed), `tags`, `timeToClose`, `priority` (High/Medium/Low), `createdAt`, `updatedAt`, `closedAt`
- **Comment** — `lead` (ref), `author` (ref), `commentText`, `createdAt`
- **Tag** — `name` (unique), `createdAt`
- **SalesAgent** — `name`, `email` (unique), `createdAt`

