# Dynamic Role-Based Content Management System (MEAN Stack)

CMS Dashboard Preview

A comprehensive Content Management System with dynamic role-based access control.

📋 **Table of Contents**
- Overview
- Features
- Prerequisites
- Installation
- Configuration
- Database Setup
- Test Users
- API Documentation
- Frontend Routes
- Screenshots
- Deployment
- Troubleshooting

📖 **Overview**
This is a dynamic Role-Based Content Management System (CMS) built with the MEAN stack (MongoDB, Express.js, Angular, Node.js). It provides secure authentication, dynamic role management, granular permissions, and full CRUD for content with role-based restrictions.

🚀 **Features**
- 🔐 Authentication & Security: JWT access/refresh tokens, bcrypt hashing, RBAC, protected routes, secure logout
- 👥 Role Management: SuperAdmin, Manager, Contributor, Viewer; custom roles; permission matrix
- 📝 Content Management: Create/read/update/delete articles, publish/unpublish, image uploads, draft vs published, role-based visibility
- 🎨 Frontend: Angular Material UI, role-based navigation, conditional rendering, route guards, real-time permission updates

🛠 **Prerequisites**
- Node.js v16+ and npm v8+
- MongoDB v4.4+
- Angular CLI v16+

Verify installations:
```bash
node --version
npm --version
mongod --version
ng version
```

📥 **Installation**
1) Clone and navigate
```bash

cd CMS
```
2) Backend setup
```bash
cd cms-backend
npm install
```
3) Frontend setup
```bash
cd ../cms-frontend
npm install
```

⚙️ **Configuration**
Backend (`cms-backend/.env`):
```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cms_db

# JWT
JWT_ACCESS_SECRET=your_access_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:4200

# File Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

Frontend (`cms-frontend/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Role-Based CMS'
};
```

🗄 **Database Setup**
1) Start MongoDB
```bash
# Windows
mongod
# macOS/Linux
sudo systemctl start mongod
# or custom path
mongod --dbpath /path/to/data
```
2) Initialize database
```bash
cd cms-backend
npm run seed
```
Creates default roles and test users.

👥 **Test Users**
- SuperAdmin — Email: <superadmin-email> — Password: <superadmin-password> — Full access
- Manager — Email: <manager-email> — Password: <manager-password> — Manage/publish articles, view users
- Contributor — Email: <contributor-email> — Password: <contributor-password> — Create/edit own articles, view published
- Viewer — Email: <viewer-email> — Password: <viewer-password> — View published only

🔌 **API Documentation**
Base URL: `http://localhost:3000/api`

Authentication
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | /auth/register | Register new user | Public |
| POST | /auth/login | User login | Public |
| GET | /auth/profile | Get user profile | Authenticated |
| PUT | /auth/profile | Update profile | Authenticated |
| PUT | /auth/change-password | Change password | Authenticated |
| POST | /auth/logout | Logout user | Authenticated |
| GET | /auth/system-roles | Get available roles | Public |

Articles
| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| GET | /articles | Get all articles | article:read |
| GET | /articles/:id | Get single article | article:read |
| POST | /articles | Create article | article:create |
| PUT | /articles/:id | Update article | article:update |
| DELETE | /articles/:id | Delete article | article:delete |
| POST | /articles/:id/publish | Publish article | article:publish |
| POST | /articles/:id/unpublish | Unpublish article | article:publish |

Roles
| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| GET | /roles | Get all roles | role:read |
| POST | /roles | Create role | role:create |
| PUT | /roles/:id | Update role | role:update |
| DELETE | /roles/:id | Delete role | role:delete |
| GET | /roles/permissions-matrix | Get permission matrix | role:read |

Users
| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| GET | /users | Get all users | user:read |
| GET | /users/:id | Get single user | user:read |
| PUT | /users/:id | Update user | user:update |
| DELETE | /users/:id | Delete user | user:delete |

Health
- GET /health — API status

🚦 **Frontend Routes**
- Public: `/`, `/login`, `/register`
- Protected: `/dashboard`, `/profile`, `/articles`, `/articles/create`, `/articles/edit/:id`, `/articles/view/:id`
- Admin (SuperAdmin): `/admin/users`, `/admin/roles`, `/admin/permissions`

📸 **Screenshots** (placeholders)
- Login: Login Page with Role Selection
- SuperAdmin Dashboard: SuperAdmin Dashboard with All Controls
- Viewer Dashboard: Viewer Dashboard with Read-Only Access
- Article Creation: Article Creation with Image Upload
- Role Management: Role Management Interface
- Permissions Matrix: Permissions Matrix Visualization
- User Profile: User Profile with Photo Upload

🌐 **Deployment**

Backend (Node.js)
- Option 1: Heroku
```bash
cd cms-backend
heroku create cms-backend
heroku addons:create mongolab
git push heroku main
heroku config:set JWT_ACCESS_SECRET=your_production_secret MONGODB_URI=your_mongodb_uri
```
- Option 2: DigitalOcean/AWS
```bash
npm run build
npm install -g pm2
pm2 start server.js --name cms-backend
pm2 save
pm2 startup
```

Frontend (Angular)
```bash
cd cms-frontend
npm run build --prod
```
- Netlify/Vercel: build `npm run build`, publish `dist/frontend` (or your Angular output)
- Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

MongoDB Deployment
- Atlas: create free cluster, get connection string, set `MONGODB_URI`
- Self-hosted (Ubuntu):
```bash
sudo apt install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

Production env vars
```dotenv
PORT=80
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cms_db
JWT_ACCESS_SECRET=strong_random_secret_key_here
JWT_REFRESH_SECRET=another_strong_random_secret_key_here
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

CORS (backend/app.js)
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

SSL (HTTPS example)
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private.key'),
  cert: fs.readFileSync('path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

Nginx reverse proxy (example)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    location / {
        root /path/to/angular/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

🐛 **Troubleshooting**
- MongoDB connection refused: start MongoDB / allowlist IP (Atlas)
- 401 Unauthorized: clear tokens and login again
- CORS errors: ensure `FRONTEND_URL` matches
- File upload too large: adjust `MAX_FILE_SIZE`
- Angular module not found: delete `node_modules`, reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```
- Logs: backend `npm run dev` or `node server.js`; frontend check browser console; Mongo logs via `mongod --logpath ...`

📁 **Project Structure**
```
CMS/
├── cms-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── scripts/
│   ├── app.js
│   └── server.js
├── cms-frontend/
│   ├── src/
│   ├── angular.json
│   └── package.json
└── README.md
```

🔧 **Development Commands**
- Backend: `npm run dev`, `npm start`, `npm test`, `npm run seed`, `npm run lint`
- Frontend: `ng serve`, `ng build`, `ng test`, `ng lint`
