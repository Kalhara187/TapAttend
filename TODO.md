# TODO: Modern Login/Register + Node.js JWT Backend

## Backend
- [x] Create `database/schema.sql` — users table
- [x] Create `server/package.json` — dependencies
- [x] Create `server/.env` — environment variables
- [x] Create `server/config/db.js` — MySQL connection
- [x] Create `server/controllers/authController.js` — register & login logic
- [x] Create `server/routes/authRoutes.js` — auth endpoints
- [x] Create `server/middleware/errorHandler.js` — error handling
- [x] Create `server/middleware/authMiddleware.js` — JWT verification
- [x] Create `server/server.js` — Express entry point

## Frontend
- [x] Update `client/package.json` — add axios
- [x] Create `client/src/components/FormInput.jsx` — reusable input with icons & password toggle
- [x] Create `client/src/pages/AuthPage.jsx` — modern split-screen login/register UI
- [x] Update `client/src/context/AuthContext.jsx` — real JWT auth (login, logout, token refresh)
- [x] Update `client/src/App.jsx` — integrate AuthPage & real auth flow

## Followup
- [x] Install client dependencies (`cd client && npm install`)
- [x] Install server dependencies (`cd server && npm install`)
- [ ] Setup MySQL database & import schema (`database/schema.sql`)
- [ ] Update `server/.env` with real DB credentials
- [ ] Start backend (`cd server && npm run dev`)
- [ ] Start frontend (`cd client && npm run dev`)
- [ ] Test full register → login → redirect flow
