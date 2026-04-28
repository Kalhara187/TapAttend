# TODO: Admin Dashboard Implementation

## Backend
- [ ] Update `database/schema.sql` — add attendance, departments tables + seed data
- [ ] Update `server/middleware/authMiddleware.js` — add requireAdmin middleware
- [ ] Create `server/controllers/adminController.js` — dashboard data endpoints
- [ ] Create `server/routes/adminRoutes.js` — admin API routes
- [ ] Update `server/server.js` — register admin routes

## Frontend Dependencies
- [ ] Install recharts and axios (`cd client && npm install recharts axios`)

## Frontend Components
- [ ] Create `client/src/services/api.js` — Axios instance with JWT interceptor
- [ ] Create `client/src/components/dashboard/StatCard.jsx` — Statistic card component
- [ ] Create `client/src/components/dashboard/SkeletonCard.jsx` — Loading skeleton
- [ ] Create `client/src/components/dashboard/AttendanceTrendChart.jsx` — Line chart
- [ ] Create `client/src/components/dashboard/MonthlySummaryChart.jsx` — Bar chart
- [ ] Create `client/src/components/dashboard/DepartmentChart.jsx` — Pie chart
- [ ] Create `client/src/pages/AdminDashboard.jsx` — Main dashboard page
- [ ] Update `client/src/App.jsx` — use AdminDashboard for /admin/dashboard route

## Testing
- [ ] Restart backend and frontend
- [ ] Login as admin and test dashboard

