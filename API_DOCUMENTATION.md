# CMS API Documentation

## Overview

The CMS Backend provides a RESTful API for managing users, roles, permissions, and articles with role-based access control. All requests (except authentication) require a valid JWT access token in the `Authorization` header.

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

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Access:** Public

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "profilePhoto": "url-optional"
}
```

**Required Fields:**
- `fullName` (string, 1-100 characters)
- `email` (string, valid email format)
- `password` (string, minimum 6 characters)
- `roleId` (string, valid MongoDB ObjectId)

**Response:** 201 Created
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Contributor",
      "permissions": [...]
    },
    "profilePhoto": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `400` - Invalid role ID
- `400` - Email already exists
- `400` - Password too short

---

### POST /auth/login

Authenticate user and receive tokens.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** 200 OK
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": {...},
    "profilePhoto": null,
    "isActive": true
  }
}
```

**Possible Errors:**
- `400` - User not found
- `400` - Invalid password

---

### GET /auth/profile

Get current user's profile.

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Contributor",
    "description": "...",
    "permissions": [...]
  },
  "profilePhoto": "uploads/profile-123.jpg",
  "isActive": true
}
```

---

### PUT /auth/profile

Update current user's profile.

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "profilePhoto": "uploads/new-photo.jpg"
}
```

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fullName": "Jane Doe",
  "email": "john@example.com",
  "role": {...},
  "profilePhoto": "uploads/new-photo.jpg",
  "isActive": true
}
```

**Restrictions:**
- Cannot update: `_id`, `role`, `isActive`
- Email must be unique if changed

---

### PUT /auth/change-password

Change current user's password.

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response:** 200 OK
```json
{
  "message": "Password changed successfully"
}
```

**Validation:**
- Current password must be correct
- New password must be at least 6 characters
- New password must differ from current

---

### GET /auth/system-roles

Get all system roles available for registration.

**Access:** Public

**Response:** 200 OK
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "SuperAdmin",
    "description": "Super Administrator with all permissions",
    "permissions": [
      {
        "resource": "user",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "resource": "role",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "resource": "article",
        "actions": ["create", "read", "update", "delete", "publish"]
      }
    ],
    "isSystemRole": true
  },
  ...
]
```

---

### POST /auth/logout

Logout current user (client-side primarily).

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** 200 OK
```json
{
  "message": "Logged out successfully",
  "clearTokens": true
}
```

---

## Article Endpoints

### GET /articles

Get all articles (filtered by user's permissions).

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `sort` (optional, default: -createdAt)

**Special Behavior:**
- **Viewers** see only published articles
- **Contributors/Managers** see all their own + published articles
- **SuperAdmin** sees all articles

**Response:** 200 OK
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Getting Started with CMS",
    "body": "This is a comprehensive guide...",
    "image": "uploads/article-banner.jpg",
    "author": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "fullName": "Jane Doe",
      "email": "jane@example.com"
    },
    "status": "published",
    "publishedAt": "2024-01-15T10:30:00Z",
    "views": 42,
    "createdAt": "2024-01-14T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

### GET /articles/:id

Get single article by ID.

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Getting Started with CMS",
  "body": "...",
  "image": "uploads/article-banner.jpg",
  "author": {...},
  "status": "published",
  "publishedAt": "2024-01-15T10:30:00Z",
  "views": 42,
  "createdAt": "2024-01-14T09:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Possible Errors:**
- `404` - Article not found
- `403` - Viewers cannot view draft articles

---

### POST /articles

Create new article.

**Access:** Authenticated + `article:create` permission

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (string, required, 1-200 characters)
- `body` (string, required)
- `image` (file, optional, max 5MB)

**Response:** 201 Created
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "New Article",
  "body": "Article content...",
  "image": "uploads/1705304400000-article.jpg",
  "author": "65a1b2c3d4e5f6g7h8i9j0k2",
  "status": "draft",
  "publishedAt": null,
  "views": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Possible Errors:**
- `403` - User lacks `article:create` permission
- `400` - Missing required fields
- `400` - File too large

---

### PUT /articles/:id

Update article.

**Access:** Authenticated + `article:update` permission

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Form Data:**
- `title` (string, optional)
- `body` (string, optional)
- `image` (file, optional)

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Updated Article",
  "body": "Updated content...",
  "image": "uploads/1705304400000-article.jpg",
  "author": "65a1b2c3d4e5f6g7h8i9j0k2",
  "status": "draft",
  "publishedAt": null,
  "views": 0,
  "createdAt": "2024-01-14T09:00:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

**Possible Errors:**
- `403` - User lacks `article:update` permission
- `404` - Article not found

---

### DELETE /articles/:id

Delete article.

**Access:** Authenticated + `article:delete` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "message": "Article deleted successfully"
}
```

**Possible Errors:**
- `403` - User lacks `article:delete` permission
- `404` - Article not found

---

### POST /articles/:id/publish

Publish article (change status to published).

**Access:** Authenticated + `article:publish` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Article Title",
  "body": "...",
  "image": "uploads/article.jpg",
  "author": "65a1b2c3d4e5f6g7h8i9j0k2",
  "status": "published",
  "publishedAt": "2024-01-15T10:40:00Z",
  "views": 0,
  "createdAt": "2024-01-14T09:00:00Z",
  "updatedAt": "2024-01-15T10:40:00Z"
}
```

**Possible Errors:**
- `403` - User lacks `article:publish` permission
- `404` - Article not found

---

### POST /articles/:id/unpublish

Unpublish article (change status to draft).

**Access:** Authenticated + `article:publish` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Article Title",
  "body": "...",
  "image": "uploads/article.jpg",
  "author": "65a1b2c3d4e5f6g7h8i9j0k2",
  "status": "draft",
  "publishedAt": null,
  "views": 0,
  "createdAt": "2024-01-14T09:00:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

---

## Role Endpoints

### GET /roles

Get all roles (system and custom).

**Access:** Authenticated + `role:read` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** 200 OK
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "SuperAdmin",
    "description": "Super Administrator",
    "permissions": [
      {
        "resource": "user",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "resource": "role",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "resource": "article",
        "actions": ["create", "read", "update", "delete", "publish"]
      }
    ],
    "isSystemRole": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

---

### POST /roles

Create new custom role.

**Access:** Authenticated + `role:create` permission

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Content Editor",
  "description": "Can edit and publish articles",
  "permissions": [
    {
      "resource": "article",
      "actions": ["create", "read", "update", "delete", "publish"]
    }
  ]
}
```

**Response:** 201 Created
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
  "name": "Content Editor",
  "description": "Can edit and publish articles",
  "permissions": [
    {
      "resource": "article",
      "actions": ["create", "read", "update", "delete", "publish"]
    }
  ],
  "isSystemRole": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Possible Errors:**
- `403` - User lacks `role:create` permission
- `400` - Role name already exists

---

### PUT /roles/:roleId

Update role permissions.

**Access:** Authenticated + `role:update` permission

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**URL Parameters:**
- `roleId` (string, valid MongoDB ObjectId)

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": [
    {
      "resource": "article",
      "actions": ["read", "create"]
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": [...],
  "isSystemRole": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

**Restrictions:**
- Cannot modify system roles (SuperAdmin, Manager, Contributor, Viewer)

---

### DELETE /roles/:roleId

Delete custom role.

**Access:** Authenticated + `role:delete` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `roleId` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "message": "Role deleted successfully"
}
```

**Possible Errors:**
- `403` - User lacks `role:delete` permission
- `400` - Cannot delete system roles
- `404` - Role not found

---

## User Endpoints

### GET /users

Get all users.

**Access:** Authenticated + `user:read` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** 200 OK
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Contributor"
    },
    "profilePhoto": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

### GET /users/:id

Get single user by ID.

**Access:** Authenticated + `user:read` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": {...},
  "profilePhoto": null,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### PUT /users/:id

Update user details.

**Access:** Authenticated + `user:update` permission

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "role": "65a1b2c3d4e5f6g7h8i9j0k3",
  "isActive": true
}
```

**Response:** 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "role": {...},
  "profilePhoto": null,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:40:00Z"
}
```

---

### DELETE /users/:id

Delete user.

**Access:** Authenticated + `user:delete` permission

**Headers:**
```
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `id` (string, valid MongoDB ObjectId)

**Response:** 200 OK
```json
{
  "message": "User deleted successfully"
}
```

---

## Health Check

### GET /health

Check if API is running.

**Access:** Public

**Response:** 200 OK
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid input or validation failed"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided or token expired"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Required permission: article:create"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!"
}
```

---

## Rate Limiting

API enforces rate limiting:
- **Limit:** 100 requests per IP
- **Window:** 15 minutes
- **Response:** 429 Too Many Requests

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "roleId": "ROLE_ID_HERE"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Articles (with token)
```bash
curl -X GET http://localhost:3000/api/articles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=My Article" \
  -F "body=Article content here" \
  -F "image=@/path/to/image.jpg"
```

---

**Last Updated:** December 30, 2024
