# ConnectHub API — NodeJS/Express + MongoDB + Cloudflare R2

A REST API for **profiles, browsing, connection requests, and connections** to support a Flutter capstone application.

This API is intentionally scoped for a 4–6 week capstone:
- ❌ No real-time sockets
- ❌ No advanced moderation systems
- ✅ Clean REST architecture
- ✅ Secure authentication
- ✅ Full CRUD operations
- ✅ Photo uploads stored in Cloudflare R2 (S3-compatible)

---

# ✅ Capstone Requirements Covered
- RESTful API design (Express routes/controllers)
- Secure endpoints (JWT or Firebase token verification)
- Structured database design (MongoDB + Mongoose)
- Error handling + validation
- User-owned records (data isolation)
- Media storage (Cloudflare R2) ✅ (bonus-looking feature)

---

# 🧱 Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- Auth (choose one):
  - Option A: Firebase Auth (verify ID token in backend)
  - Option B: JWT (email+password backend login)
- Cloudflare R2 (S3 compatible) for image storage

> Recommended for speed: **Firebase Auth** + backend verifies Firebase ID token.

---

# 📊 Project Progress Tracker

## 🏗 Setup & Foundation
- [x] Initialize Node project
- [x] Install dependencies
- [x] Setup Express server
- [x] Setup environment variables
- [x] Connect MongoDB
- [x] Create base folder structure
- [x] Add central error handler + response helpers
- [x] Test server health endpoint

## 🔐 Authentication
- [ ] Firebase token verification middleware **OR** JWT middleware
- [ ] Protect private routes
- [ ] Create `GET /auth/me`

## 🧑 Profiles (CRUD)
- [x] Create/Update profile
- [x] Get current user profile
- [x] Delete profile
- [x] Validate inputs + return clean errors

## 🔍 Browse & Filtering
- [x] Browse profiles (exclude self)
- [x] Filter by location
- [x] Filter by interests
- [ ] Pagination (bonus)

## 📩 Requests & Connections
- [x] Send request
- [x] Prevent duplicates
- [x] Incoming requests
- [x] Outgoing requests
- [x] Accept/Decline request
- [x] Connections list
- [x] Remove connection

## 🖼 Cloudflare R2 Uploads
- [x] Configure R2 client
- [x] Upload profile photo(s)
- [x] Store photo URL in profile
- [ ] Delete/replace photo (optional)

## 🧪 Testing & Final Review
- [ ] Data isolation checks
- [ ] Input validation checks
- [ ] Postman collection / curl examples
- [ ] Ready for Flutter integration

---

# 📁 Suggested Project Structure

src/
├── config/
│   ├── env.js
│   ├── db.js
│   └── r2.js
├── middleware/
│   ├── auth.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
├── models/
│   ├── User.js
│   ├── Profile.js
│   ├── ConnectionRequest.js
│   └── Connection.js
├── routes/
│   ├── auth.routes.js
│   ├── profiles.routes.js
│   ├── browse.routes.js
│   ├── requests.routes.js
│   ├── connections.routes.js
│   └── uploads.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── profiles.controller.js
│   ├── browse.controller.js
│   ├── requests.controller.js
│   ├── connections.controller.js
│   └── uploads.controller.js
├── utils/
│   ├── response.js
│   └── asyncHandler.js
└── server.js

---

# ⚙️ Setup (Start to Finish)

## 1️⃣ Initialize project
```bash
mkdir connecthub-api
cd connecthub-api
npm init -y