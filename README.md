# Pharmacy2026

An Angular pharmacy application with an Express and PostgreSQL backend for registering clients and managing prescriptions.

## Run the application

Start the frontend:

```bash
npm start
```

Start the backend in another terminal:

```bash
cd backend
npm start
```

The backend requires PostgreSQL configuration in `backend/.env`. Copy `backend/.env.example` to create it.

## Client sign-up and login

Apply the additive account migration once, then run the API:

```bash
cd backend
npm run migrate
npm start
```

Open `/signup` in the Angular app, create an account, then sign in at `/login`.
New accounts require first name, last name, email and a 12–128 character password.
The development server proxies `/api` to port 8080, keeping session cookies on the
same host. Restart `npm start` after changing proxy configuration. A production
host must also proxy `/api` to the backend and use HTTPS (`NODE_ENV=production`).

In pgAdmin 4, refresh **pharmacy_db → Schemas → public → Tables**. Registered
accounts appear in **client_accounts**, with hashed passwords; **client_sessions**
stores expiring session token hashes. Account creation does not associate someone
with existing prescription records by name, or grant access to those records.

Run database-backed authentication tests with `cd backend && npm test` after the
migration. Test account/session writes run inside a transaction and are rolled back.
