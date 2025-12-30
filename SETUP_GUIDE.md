# Role-Based CMS - Complete Setup Guide

A dynamic Content Management System built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) featuring role-based access control, dynamic permissions, and secure authentication.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Initialization](#database-initialization)
5. [Running the Application](#running-the-application)
6. [Test Users](#test-users)
7. [API Endpoints](#api-endpoints)
8. [Frontend Routes](#frontend-routes)
9. [Features Overview](#features-overview)

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Angular CLI** (v16+) - Install globally: `npm install -g @angular/cli`

### Verify Installation
```bash
node --version
npm --version
mongod --version
ng version
```

---

## Installation

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

## Configuration

### Backend Environment Variables

Create a `.env` file in `cms-backend/` with the following content:

```dotenv
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cms_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-please-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-please-change-this-in-production
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:4200

# File Upload Configuration
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif
```

### Frontend Environment Configuration

The frontend is already configured to connect to `http://localhost:3000/api`.

Verify in `cms-frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  backendUrl: 'http://localhost:3000'
};
```

---

## Database Initialization

### Step 1: Start MongoDB

```bash
# Windows (if installed as service, skip this)
mongod

# macOS/Linux
brew services start mongodb-community

# Or run in terminal
mongod --dbpath /path/to/data
```

### Step 2: Initialize Roles and Users

Navigate to the backend directory:

```bash
cd cms-backend

# Initialize system roles (SuperAdmin, Manager, Contributor, Viewer)
npm run init-roles
```

You should see output like:
```
Connected to MongoDB
Deleting existing system roles...
Creating new system roles...
Created role: SuperAdmin (ID: 65a1b2c3d4e5f6g7h8i9j0k1)
Created role: Manager (ID: 65a1b2c3d4e5f6g7h8i9j0k2)
Created role: Contributor (ID: 65a1b2c3d4e5f6g7h8i9j0k3)
Created role: Viewer (ID: 65a1b2c3d4e5f6g7h8i9j0k4)
System roles initialized successfully
```

---

## Running the Application

### Step 1: Start Backend Server

From `cms-backend/`:

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Expected output:
```
Server running on port 3000
MongoDB Connected: localhost
```

### Step 2: Start Frontend Server

From `cms-frontend/` (in a new terminal):

```bash
ng serve

# Or with specific port
ng serve --port 4200
```

Expected output:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

---

## Test Users

Use these pre-configured accounts to test different roles. You can register new users through the UI, or use these for immediate testing.

### 1. SuperAdmin User
- **Email:** `superadmin@cms.com`
- **Password:** `password123`
- **Permissions:** Full access - create/edit/delete users, roles, permissions, and articles. Can publish content.

### 2. Manager User
- **Email:** `manager@cms.com`
- **Password:** `password123`
- **Permissions:** Manage articles (create, edit, delete, publish). Can view permissions matrix.

### 3. Contributor User
- **Email:** `contributor@cms.com`
- **Password:** `password123`
- **Permissions:** Create and edit articles (draft only). Cannot publish.

### 4. Viewer User
- **Email:** `viewer@cms.com`
- **Password:** `password123`
- **Permissions:** View published articles only. Read-only access.

### Creating Test Users via API

You can also create test users programmatically:

```bash
# First, get the role IDs
curl http://localhost:3000/api/roles

# Then register a user with the role ID
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "roleId": "ROLE_ID_HERE"
  }'
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k1"
}

Response: 201 Created
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": { ... }
  }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "superadmin@cms.com",
  "password": "password123"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "_id": "...",
  "fullName": "...",
  "email": "...",
  "role": { ... },
  "profilePhoto": "..."
}
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "profilePhoto": "..."
}

Response: 200 OK
```

#### Change Password
```
PUT /auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

Response: 200 OK
```

#### Get System Roles
```
GET /auth/system-roles
Response: 200 OK
[
  {
    "_id": "...",
    "name": "SuperAdmin",
    "description": "...",
    "permissions": [ ... ]
  },
  ...
]
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Logged out successfully",
  "clearTokens": true
}
```

---

### Article Endpoints

#### Get All Articles
```
GET /articles
Authorization: Bearer {accessToken}

Response: 200 OK
[
  {
    "_id": "...",
    "title": "Article Title",
    "body": "Article content...",
    "image": "url",
    "author": { "fullName": "...", "email": "..." },
    "status": "published|draft",
    "publishedAt": "2024-01-15T10:30:00Z",
    "views": 42,
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

#### Get Single Article
```
GET /articles/:id
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "_id": "...",
  "title": "...",
  ...
}
```

#### Create Article
```
POST /articles
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Requires permission: article:create

Form Data:
- title: string (required)
- body: string (required)
- image: file (optional)

Response: 201 Created
{ ... article object ... }
```

#### Update Article
```
PUT /articles/:id
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Requires permission: article:update

Form Data:
- title: string (optional)
- body: string (optional)
- image: file (optional)

Response: 200 OK
{ ... updated article object ... }
```

#### Delete Article
```
DELETE /articles/:id
Authorization: Bearer {accessToken}

Requires permission: article:delete

Response: 200 OK
{ "message": "Article deleted successfully" }
```

#### Publish Article
```
POST /articles/:id/publish
Authorization: Bearer {accessToken}

Requires permission: article:publish

Response: 200 OK
{
  "_id": "...",
  "status": "published",
  "publishedAt": "2024-01-15T10:30:00Z",
  ...
}
```

#### Unpublish Article
```
POST /articles/:id/unpublish
Authorization: Bearer {accessToken}

Requires permission: article:publish

Response: 200 OK
{
  "_id": "...",
  "status": "draft",
  "publishedAt": null,
  ...
}
```

---

### Role & Permission Endpoints

#### Get All Roles
```
GET /roles
Authorization: Bearer {accessToken}

Requires permission: role:read

Response: 200 OK
[
  {
    "_id": "...",
    "name": "SuperAdmin",
    "description": "...",
    "permissions": [
      {
        "resource": "user",
        "actions": ["create", "read", "update", "delete"]
      },
      ...
    ],
    "isSystemRole": true
  },
  ...
]
```

#### Create Role
```
POST /roles
Authorization: Bearer {accessToken}
Content-Type: application/json

Requires permission: role:create

{
  "name": "Custom Role",
  "description": "Role description",
  "permissions": [
    {
      "resource": "article",
      "actions": ["create", "read"]
    }
  ]
}

Response: 201 Created
{ ... role object ... }
```

#### Update Role
```
PUT /roles/:roleId
Authorization: Bearer {accessToken}
Content-Type: application/json

Requires permission: role:update

{
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": [...]
}

Response: 200 OK
{ ... updated role object ... }
```

#### Delete Role
```
DELETE /roles/:roleId
Authorization: Bearer {accessToken}

Requires permission: role:delete

Response: 200 OK
{ "message": "Role deleted successfully" }
```

---

### User Endpoints

#### Get All Users
```
GET /users
Authorization: Bearer {accessToken}

Requires permission: user:read

Response: 200 OK
[
  {
    "_id": "...",
    "fullName": "...",
    "email": "...",
    "role": { ... },
    "profilePhoto": "...",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

#### Get Single User
```
GET /users/:id
Authorization: Bearer {accessToken}

Requires permission: user:read

Response: 200 OK
{ ... user object ... }
```

#### Update User
```
PUT /users/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

Requires permission: user:update

{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "role": "roleId"
}

Response: 200 OK
{ ... updated user object ... }
```

#### Delete User
```
DELETE /users/:id
Authorization: Bearer {accessToken}

Requires permission: user:delete

Response: 200 OK
{ "message": "User deleted successfully" }
```

---

### Health Check

#### Server Health
```
GET /health

Response: 200 OK
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

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

### Error Routes
- `/unauthorized` - Access denied page
- `**` - 404 redirect to home

---

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

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Kill process on port 3000 or change PORT in `.env`

### JWT Token Expired
```
Error: 401 Unauthorized
```
**Solution:** Log out and log back in to get a fresh token

### Duplicate Key Error on User Creation
```
E11000 duplicate key error collection: cms_db.users index: fullname_1
```
**Solution:** Run the cleanup script:
```bash
mongosh "mongodb://localhost:27017/cms_db" --eval "db.users.dropIndex('fullname_1')"
```

### Image Upload Not Working
Ensure the `uploads/` directory exists in `cms-backend/`. If not:
```bash
mkdir cms-backend/uploads
```

---

## Project Structure

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

---

## Development Tips

### Enable CORS for Testing
If testing from a different origin, update `FRONTEND_URL` in `.env`:
```dotenv
FRONTEND_URL=http://your-domain.com:port
```

### Testing with Postman/Insomnia
1. Register/login to get access token
2. Add `Authorization: Bearer {token}` to request headers
3. Test endpoints with appropriate permissions

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

---

## Production Deployment

Before deploying to production:

1. **Change JWT secrets** in `.env`
2. **Enable HTTPS** - Update API URLs
3. **Set NODE_ENV=production**
4. **Build frontend:** `ng build --prod`
5. **Use environment-specific configs**
6. **Set up database backups**
7. **Enable rate limiting** on production servers
8. **Use reverse proxy** (Nginx/Apache)

---

## Support & Questions

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoint documentation
3. Check browser console for frontend errors
4. Check backend logs with `npm run dev`

---

**Last Updated:** December 30, 2024  
**Version:** 1.0.0
