# Major Project 2 Backend

A Node.js/Express REST API for managing sales leads, with reporting endpoints. Built with MongoDB (Mongoose).

# Tech Stack
- Runtime: Node.js (CommonJS)
- Framework: Express 5
- ODM: Mongoose 9
- Database: MongoDB Atlas

# Getting Started
'cp' '.env' '.env.local'   
'npm install'
'npm run dev'           # requires nodemon, or node index.js

Server starts on http://localhost:3000.

# API Endpoints
Method	Path
Leads	 
POST	/leads
GET	/leads
PUT	/leads/:id
DELETE	/leads/:id
Comments	 
POST	/leads/:id/comments
GET	/leads/:id/comments
Tags	 
POST	/tags
GET	/tags
Sales Agents	 
POST	/agents
GET	/agents
Reports	 
GET	/report/last-week
GET	/report/pipeline
GET	/report/closed-by-agent

# Data Models
- Lead — name, source, salesAgent (ref), status (New/Contacted/Qualified/Proposal Sent/Closed), tags, timeToClose, priority (High/Medium/Low), createdAt, updatedAt, closedAt
- Comment — lead (ref), author (ref), commentText, createdAt
- Tag — name (unique), createdAt
- SalesAgent — name, email (unique), createdAt
