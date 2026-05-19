# Project Management App

A simple role-based project management web app with Admin and Member dashboards.

## Features

- Signup / Login with JWT authentication
- Admin and Member role-based authorization
- Admin: create/edit/delete projects, manage users, assign tasks, view reports
- Member: view assigned tasks, update task status, view deadlines and notifications
- Dashboard analytics and overdue task tracking
- Backend: Express + MySQL
- Frontend: static HTML/CSS/JS

## Local Setup

1. Open terminal in `BACKEND`:
   ```powershell
   cd "c:\Users\devan\OneDrive\Desktop\project-management-app\BACKEND"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create a `.env` file in `BACKEND` with:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=project_management
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. Start the server:
   ```powershell
   npm run dev
   ```

5. Visit the app in your browser:
   ```text
   http://localhost:5000
   ```

## Deployment Notes

- The backend serves the frontend from `BACKEND/frontend`.
- API endpoints are available under `/api/*`.
- Use relative API paths so the app works on any host.
- For Railway deployment, set environment variables in the Railway dashboard.

## Railway Deployment Steps

1. Push this repo to GitHub.
2. Create a new Railway project.
3. Connect your GitHub repo.
4. Set the root folder to `BACKEND` (if prompted).
5. Add environment variables in Railway:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `PORT=5000`
6. Deploy and open the live URL.
