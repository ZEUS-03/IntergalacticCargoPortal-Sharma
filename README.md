# Intergalactic Cargo Portal

## Backend

1. Open a terminal in `backend/`.
2. Install dependencies:

```bash
npm install
```

3. Start the backend:

```bash
npm run dev
```

The frontend Vite proxy is configured for `http://localhost:3001`. If you want the full app to work locally without changing the proxy, set `PORT=3001` in `backend/.env` before starting the server.

## Frontend

1. Open a second terminal in `frontend/`.
2. Install dependencies:

```bash
npm install
```

3. Start the Vite app:

```bash
npm run dev
```

The backend stores the JWT in an `HttpOnly` cookie and the frontend restores auth state by calling `/session`. Authenticated requests rely on the browser sending that cookie automatically.
