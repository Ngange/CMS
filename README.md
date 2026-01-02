# Dynamic Role-Based Content Management System (MEAN Stack)

#### Netlify: https://cms-role-base-access.netlify.app/

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
- Routes
- Screenshots
- Project Structure

📖 **Overview**
This is a dynamic Role-Based Content Management System (CMS) built with the MEAN stack (MongoDB, Express.js, Angular, Node.js). It provides secure authentication, dynamic role management, granular permissions, and full CRUD for content with role-based restrictions. The CMS Backend provides a RESTful API for managing users, roles, permissions, and articles with role-based access control. All requests (except authentication) require a valid JWT access token in the `Authorization` header.

**Base URL:** `http://localhost:3000/api`

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (Access Denied) |
| 404 | Not Found |
| 500 | Server Error |

## Authentication

### JWT Bearer Token

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Token lifetime:
- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

🚀 **Features**
- 🔐 Authentication & Security: JWT access/refresh tokens, bcrypt hashing, RBAC, protected routes, secure logout
- 👥 Role Management: SuperAdmin, Manager, Contributor, Viewer; custom roles; permission matrix
- 📝 Content Management: Create/read/update/delete articles, publish/unpublish, image uploads, draft vs published, role-based visibility
- 🎨 Frontend: Angular Material UI, role-based navigation, conditional rendering, route guards, real-time permission updates

## Features Overview

### Authentication & Authorization
- ✅ JWT-based authentication with access & refresh tokens
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Dynamic permission system
- ✅ Secure logout functionality

### Role Management
- ✅ Four default roles: SuperAdmin, Manager, Contributor, Viewer
- ✅ Custom role creation by SuperAdmin
- ✅ Dynamic permission assignment
- ✅ Permission inheritance model

### Content Management
- ✅ Create articles with optional image upload
- ✅ Edit and delete articles
- ✅ Publish/unpublish functionality (Manager & SuperAdmin only)
- ✅ Article view counter
- ✅ Draft and published status

### User Interface
- ✅ Clean, responsive design
- ✅ Role-based navigation menu
- ✅ Conditional component display based on permissions
- ✅ Permission directive (`*appHasPermission`)
- ✅ Access matrix showing role-permission mapping
- ✅ Real-time user profile updates

### Security Features
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ JWT token expiration
- ✅ Password hashing with bcrypt
- ✅ Authorization middleware on backend


🛠 **Prerequisites**

Ensure you have the following installed on your machine:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Angular CLI** (v16+) - Install globally: `npm install -g @angular/cli`

Verify installations:
```bash
node --version
npm --version
mongod --version
ng version
```

 ## 📥Installation

### Step 1: Clone/Navigate to Project Directory

```bash
cd CMS
```

### Step 2: Backend Setup

```bash
cd cms-backend

# Install dependencies
npm install
```

### Step 3: Frontend Setup

```bash
cd ../cms-frontend

# Install dependencies
npm install
```

---

 ## **⚙️Configuration**
Backend (`cms-backend/.env`):
```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your_db

# JWT
JWT_ACCESS_SECRET=your_access_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
ACCESS_TOKEN_EXPIRY=1h
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

 ## **🗄 Database Setup**
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
npm run .\scripts\init-roles.js
npm run .\scripts\create-admin.js
npm run .\scripts\create-users-and-articles.js
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
| Method | Endpoint               | Description         | Access        |
| ---    | ---                    | ---                 | ---           |
| POST   | /auth/register         | Register new user   | Public        |
| POST   | /auth/login            | User login          | Public        |
| GET    | /auth/profile          | Get user profile    | Authenticated |
| PUT    | /auth/profile          | Update profile      | Authenticated |
| PUT    | /auth/change-password  | Change password     | Authenticated |
| POST   | /auth/logout           | Logout user         | Authenticated |
| GET    | /auth/system-roles     | Get available roles | Public        |

Articles
| Method | Endpoint                | Description        | Permission      |
| ---    | ---                     | ---                | ---             |
| GET    | /articles               | Get all articles   | article:read    |
| GET    | /articles/:id           | Get single article | article:read    |
| POST   | /articles               | Create article     | article:create  |
| PUT    | /articles/:id           | Update article     | article:update  |
| DELETE | /articles/:id           | Delete article     | article:delete  |
| POST   | /articles/:id/publish   | Publish article    | article:publish |
| POST   | /articles/:id/unpublish | Unpublish article  | article:publish |

Roles
| Method | Endpoint                  | Description           | Permission  |
| ---    | ---                       | ---                   | ---         |
| GET    | /roles                    | Get all roles         | role:read   |
| POST   | /roles                    | Create role           | role:create |
| PUT    | /roles/:id                | Update role           | role:update |
| DELETE | /roles/:id                | Delete role           | role:delete |
| GET    | /roles/permissions-matrix | Get permission matrix | role:read   |

Users
| Method | Endpoint   | Description     | Permission  |
| ---    | ---        | ---             | ---         |
| GET    | /users     | Get all users   | user:read   |
| GET    | /users/:id | Get single user | user:read   |
| PUT    | /users/:id | Update user     | user:update |
| DELETE | /users/:id | Delete user     | user:delete |


## Frontend Routes

### Public Routes
- `/` - Home page
- `/login` - User login
- `/register` - User registration

### Protected Routes (Requires Authentication)
- `/dashboard` - User dashboard (all authenticated users)
- `/profile` - User profile (all authenticated users)
- `/articles` - Article list (requires `article:read` permission)
- `/articles/create` - Create article (requires `article:create` permission)
- `/articles/view/:id` - View single article (all authenticated users)
- `/articles/edit/:id` - Edit article (requires `article:update` permission)

### Admin Routes (SuperAdmin Only)
- `/admin/users` - User management
- `/admin/roles` - Role management
- `/admin/permissions` - Permissions matrix


📸 **Screenshots** (placeholders)
- Login: Login Page and Registration page - users can only register as "Viewer" which is the default role. Super Admin can change user role after registration.
![Login Page](./screenshots/login.png) 
![Registration page](./screenshots/register.png)

- SuperAdmin Dashboard: SuperAdmin Dashboard with All Controls
![Registration page](./screenshots/admin-dashboard.png)

- Viewer Dashboard: Viewer Dashboard with Read-Only Access ![Viewer Dashboard](./screenshots/viewer%20dashboard.png)

- Article Creation: Article Creation with Image Upload ![Article Creation](./screenshots/create-article.png)

- Role Management: Role Management Interface
![Role Management](./screenshots/roles.png)

- Permissions Matrix: Permissions Matrix Visualization ![Permissions](./screenshots/permissions.png)

- User Profile: User Profile with Photo Upload ![User Profile](./screenshots/profile.png)

- Users: List of users with their details editable by superAdmin ![List of Users](./screenshots/list-of-users.png)


📁 **Project Structure**
```
CMS/
├── cms-backend/
│   ├── config/              # Database & JWT configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth & authorization middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── scripts/             # Utility scripts
│   ├── uploads/             # Uploaded files
│   ├── server.js            # Entry point
│   ├── app.js               # Express app configuration
│   ├── package.json         # Dependencies
│   └── .env                 # Environment variables
│
└── cms-frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/        # Guards, services, models, interceptors
    │   │   ├── modules/     # Feature modules (admin, articles, profile, public)
    │   │   ├── shared/      # Shared components & directives
    │   │   └── app.module.ts # Main app module
    │   ├── assets/          # Static assets
    │   ├── environments/    # Environment config
    │   ├── styles.css       # Global styles
    │   └── main.ts          # Bootstrap
    ├── angular.json         # Angular CLI config
    └── package.json         # Dependencies
```

🔧 **Development Commands**
- Backend: `npm run dev`, `npm start`, `npm test`, `npm run seed`, `npm run lint`
- Frontend: `ng serve`, `ng build`, `ng test`, `ng lint`
