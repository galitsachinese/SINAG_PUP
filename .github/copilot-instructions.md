# PUP-SINAG Development Guide

## Project Overview

**PUP-SINAG** (PUP System for Internship Navigation and Guidance) is a full-stack internship management system for Polytechnic University of the Philippines. It manages workflows for coordinators, advisers, interns, and company supervisors.

## Architecture

### Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 (in `src/`)
- **Backend**: Node.js + Express + Sequelize ORM (in `back-end/`)
- **Database**: MySQL
- **Auth**: JWT tokens (5-minute expiration, stored in `localStorage`)

### Project Structure

```
sinag/
├── src/                          # React frontend
│   ├── Components/               # Reusable UI components
│   ├── Pages/                    # Page components (role-based layouts)
│   ├── Context/AuthContext.jsx   # Auth state management
│   └── services/axios.js         # API client with interceptors
├── back-end/                     # Express backend
│   ├── app.js                    # Main server entry (loads routes dynamically)
│   ├── config/database.js        # Sequelize MySQL connection
│   ├── models/index.js           # Auto-loads all models with associations
│   ├── controllers/              # Business logic by feature
│   ├── routes/                   # Express route definitions
│   ├── middleware/               # authMiddleware, upload (multer)
│   └── uploads/                  # File storage (PDFs, images)
└── .env                          # Backend config (JWT_SECRET, MYSQL_*, EMAIL_*)
```

### Role-Based Access

Four primary roles (normalized to lowercase in JWT):

- **coordinator**: Manages advisers, interns, companies (HTE)
- **adviser**: Manages assigned interns, approves documents
- **intern**: Submits documents, daily logs, consent forms
- **supervisor** (normalized to `company` in auth): Company supervisors evaluating interns

**Key Pattern**: `authMiddleware(['role1', 'role2'])` enforces access. See [back-end/middleware/authMiddleware.js](back-end/middleware/authMiddleware.js#L11-L24).

## Development Workflows

### Running the Application

**Backend** (port 5000):

```powershell
cd back-end
npm start  # or node app.js
```

- Sequelize auto-syncs models on startup
- Requires MySQL running locally

**Frontend** (port 5173):

```powershell
npm run dev
```

- Vite dev server with HMR
- Proxies `/api` to `http://localhost:5000` (see [vite.config.js](vite.config.js#L19-L25))

### Environment Setup

Backend requires [back-end/.env](back-end/.env):

```env
JWT_SECRET=your-secret-key
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=pup_sinag
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

Frontend uses `VITE_API_URL` (optional, defaults to `http://localhost:5000`).

## Critical Patterns

### API Communication

**Frontend**: Use [src/services/axios.js](src/services/axios.js) configured instance:

```javascript
import api from '@/services/axios';
const response = await api.get('/intern-evaluations');
```

- Automatically attaches JWT from `localStorage.getItem('token')`
- Base URL: `VITE_API_URL/api` or `http://localhost:5000/api`

**Direct fetch** still used in many components (inconsistent pattern):

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
fetch(`${API_BASE}/api/auth/login`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Backend Route Loading

[back-end/app.js](back-end/app.js#L77-L86) uses `loadRoute()` helper to safely load routes:

- Catches missing/broken route files without crashing server
- Routes mounted BEFORE database connection
- Convention: `/api/<feature>` (e.g., `/api/auth`, `/api/documents`)

### File Uploads

**Multer** middleware ([back-end/middleware/upload.js](back-end/middleware/upload.js)):

- Files saved to `back-end/uploads/` with naming: `{LASTNAME}_{ORIGINAL_NAME}.ext`
- MOA files: `{COMPANY_FIRST_WORD}_MOA.ext`
- Served statically at `http://localhost:5000/uploads/{filename}`
- CORS explicitly enabled for uploads (see [app.js](back-end/app.js#L43-L72))

Example route:

```javascript
router.post('/intern-docs', authMiddleware(['intern']), upload.single('file'), controller.uploadDoc);
```

### Sequelize Model Patterns

**Model auto-loading**: [back-end/models/index.js](back-end/models/index.js#L12-L50) scans directory:

1. Requires each `.js` file (except `index.js`, `.test.js`)
2. Supports factory functions: `module.exports = (sequelize, DataTypes) => { ... }`
3. Calls `Model.associate(db)` after all models loaded

**Association example** ([back-end/models/interns.js](back-end/models/interns.js#L90-L140)):

```javascript
Intern.associate = (models) => {
  Intern.belongsTo(models.User, { as: 'adviser', foreignKey: 'adviser_id' });
  Intern.belongsTo(models.Company, { foreignKey: 'company_id' });
  Intern.hasMany(models.InternDocuments, { foreignKey: 'intern_id' });
};
```

### Authentication Flow

1. **Login**: [POST /api/auth/login](back-end/routes/auth.js#L24) returns JWT token
2. **Token storage**: Frontend stores in `localStorage.getItem('token')`
3. **Auto-refresh check**: [AuthContext.jsx](src/Context/AuthContext.jsx#L14-L38) calls `/api/auth/me` on mount
4. **Inactivity logout**: `useInactivityLogout()` hook (15-min idle timeout)
5. **Force password change**: New users redirected to `/change-password`

### Frontend Routing

Role-based navigation ([src/App.jsx](src/App.jsx#L1-L50)):

- `<ProtectedRoute role="coordinator">` wraps authenticated pages
- Layout components: `CoordinatorLayout`, `AdviserLayout`, `InternLayout`, `SupervisorLayout`
- Base path for production: `/pup-sinag/` (see [vite.config.js](vite.config.js#L10))

## Common Issues

### CORS Errors on Uploads

Ensure [app.js](back-end/app.js#L20-L22) has:

```javascript
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
```

And static middleware sets headers explicitly (lines 43-72).

### Supervisor vs Company Role

Backend uses **`company`** role internally but frontend/auth often use **`supervisor`**.
[authMiddleware.js](back-end/middleware/authMiddleware.js#L64-L67) normalizes:

```javascript
if (effectiveRole === 'supervisor') effectiveRole = 'company';
```

### Database Connection Delays

Server starts AFTER database connection ([app.js](back-end/app.js#L179-L199)):

```javascript
sequelize
  .authenticate()
  .then(() => sequelize.sync())
  .then(() => app.listen(PORT));
```

Routes are defined before connection, but handlers execute after.

## Code Conventions

- **Backend**: CommonJS (`require`), no TypeScript
- **Frontend**: ES modules (`import`), JSX files
- **Naming**:
  - Models: PascalCase (e.g., `InternDocuments`)
  - Routes: kebab-case endpoints (e.g., `/api/intern-evaluations`)
  - Files: camelCase controllers, PascalCase components
- **Error handling**: Controllers catch errors and return JSON with `message` field
- **Logging**: `console.log` with emojis (✅, ❌, 🔄) for visibility

## Key Files Reference

- [back-end/app.js](back-end/app.js) - Server setup, route loading, static files
- [back-end/models/index.js](back-end/models/index.js) - Model auto-loader with associations
- [src/Context/AuthContext.jsx](src/Context/AuthContext.jsx) - Auth state, login/logout, user data
- [back-end/middleware/authMiddleware.js](back-end/middleware/authMiddleware.js) - JWT verification, role checks
- [src/services/axios.js](src/services/axios.js) - Configured API client (use this for new requests)
