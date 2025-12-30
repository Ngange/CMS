# Dynamic Role-Based CMS (MEAN)

A full-stack CMS with JWT auth, dynamic roles/permissions, and image uploads built on MongoDB, Express.js, Angular, and Node.js.

## Project Structure
```
CMS/
├── cms-backend/      # Express API, auth, RBAC, uploads
├── cms-frontend/     # Angular app with guards/interceptors
└── README.md
```

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), Multer, JWT, Bcrypt
- **Frontend:** Angular, Angular Material, RxJS
- **Auth:** Access + refresh tokens, role/permission checks server- and client-side

## Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Angular CLI 16+

Verify:
```bash
node --version
npm --version
mongod --version
ng version
```

## Local Setup
1) Clone & install
```bash
# from CMS/
cd cms-backend && npm install
cd ../cms-frontend && npm install
```

2) Backend env (`cms-backend/.env`)
```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cms_db
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif
```

3) Frontend environment (`cms-frontend/src/environments/environment.ts` already points to `http://localhost:3000/api`).

4) Initialize roles (Mongo running)
```bash
cd cms-backend
npm run init-roles
```

5) Run locally
```bash
# backend
cd cms-backend
npm run dev

# frontend (new terminal)
cd cms-frontend
ng serve
```
Visit http://localhost:4200

## Test Users
- SuperAdmin: `superadmin@cms.com` / `password123`
- Manager: `manager@cms.com` / `password123`
- Contributor: `contributor@cms.com` / `password123`
- Viewer: `viewer@cms.com` / `password123`

## API Overview (base: `http://localhost:3000/api`)
- Auth: POST `/auth/register`, POST `/auth/login`, GET `/profile`, PUT `/profile`, POST `/auth/change-password`, POST `/auth/logout`, GET `/auth/system-roles`
- Articles: GET `/articles`, GET `/articles/:id`, POST `/articles`, PUT `/articles/:id`, DELETE `/articles/:id`, POST `/articles/:id/publish`, POST `/articles/:id/unpublish`
- Roles: GET `/roles`, POST `/roles`, PUT `/roles/:roleId`, DELETE `/roles/:roleId`
- Users: GET `/users`, GET `/users/:id`, PUT `/users/:id`, DELETE `/users/:id`
- Health: GET `/health`

## Frontend Routes
- Public: `/`, `/login`, `/register`
- Protected: `/dashboard`, `/profile`, `/articles`, `/articles/create`, `/articles/view/:id`, `/articles/edit/:id`
- Admin: `/admin/users`, `/admin/roles`, `/admin/permissions`

## Production Deployment (free-friendly)
### 1) Database (MongoDB Atlas)
- Create free M0 cluster → add DB user → allow IPs → copy connection string
- Set `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/cms_db?retryWrites=true&w=majority`

### 2) Backend (Render or Railway)
- Connect repo → create Web Service
- Build: `npm install`
- Start: `npm start`
- Env vars: `PORT=3000`, `NODE_ENV=production`, `MONGODB_URI=...`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`, `FRONTEND_URL=https://your-frontend-url`
- Note: Free tiers have **ephemeral storage**; use cloud storage for uploads (see below).

### 3) Frontend (Vercel or Netlify)
- Framework preset: Angular; root: `cms-frontend`
- Build: `ng build --configuration production`
- Output: `dist/cms-frontend/browser`
- Update `environment.prod.ts` with your backend URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.onrender.com/api',
  backendUrl: 'https://your-backend.onrender.com'
};
```
- Deploy; then set `FRONTEND_URL` on backend to the deployed frontend URL.

### 4) File Uploads in Production
Render/Railway file systems reset on deploy. Use cloud storage:
- **Cloudinary (recommended for images):** `cloudinary`, `multer-storage-cloudinary`
- **AWS S3 / DigitalOcean Spaces:** S3-compatible buckets
Update upload middleware to use cloud storage instead of local disk.

### 5) Prod Checklist
- Rotate strong JWT secrets
- Set `NODE_ENV=production`
- Enable CORS for your frontend URL only
- Run `npm run init-roles` against production DB once
- Test auth, roles, uploads end-to-end
- Add HTTPS (platform-provided TLS on Render/Vercel/Netlify)

## Troubleshooting
- Mongo refused: ensure MongoDB running / Atlas IP allowlist
- 401/403: re-login to refresh tokens; verify permissions
- CORS errors: check `FRONTEND_URL` matches deployed frontend
- Uploads disappearing: move to Cloudinary/S3
- Angular build issues: delete `node_modules` and reinstall

## Key Scripts
- Backend: `npm run dev`, `npm start`, `npm run init-roles`
- Frontend: `ng serve`, `ng build --configuration production`

## License
MIT (add LICENSE file if required).
