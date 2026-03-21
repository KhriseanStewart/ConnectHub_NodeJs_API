# ConnectHub API — Route reference

Base URL examples: `http://localhost:4000` (local) or your Vercel deployment URL.

Unless noted, **protected** routes need a header:

```http
Authorization: Bearer <JWT>
```

Responses use the shared shape: `{ success, message, data?, error? }` (see `utils/response.js`).

---

## Root

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Health / welcome text: “Welcome to the ConnectHub API”. |

---

## Auth — `/api/auth`

| Method | Path | Auth | Body / params | Description |
|--------|------|------|---------------|-------------|
| `POST` | `/api/auth/register` | No | `{ name, email, password }` | Create a new user account. |
| `POST` | `/api/auth/login` | No | `{ email, password }` | Log in; returns `user` and JWT `token`. |
| `GET` | `/api/auth/me` | Yes | — | Returns the current user (from token). |
| `POST` | `/api/auth/forgot-password` | No | `{ email }` | Sends password-reset OTP email if the user exists (same message either way for privacy). |
| `POST` | `/api/auth/reset-password` | No | `{ email, otp, newPassword }` | Validates OTP and sets a new password. |
| `POST` | `/api/auth/logout` | Yes | — | Stateless logout acknowledgment (client discards token). |

---

## Profiles — `/api/profiles`

| Method | Path | Auth | Body / params | Description |
|--------|------|------|---------------|-------------|
| `POST` | `/api/profiles/create` | Yes | `{ displayName, bio, location, interests, photoUrls, occupation }` | Create profile for the logged-in user. |
| `GET` | `/api/profiles/` | Yes | — | Get **your** profile. |
| `PUT` | `/api/profiles/update` | Yes | Same fields as create | Update **your** profile. |
| `DELETE` | `/api/profiles/delete` | Yes | — | Delete **your** profile. |
| `PUT` | `/api/profiles/avatar` | Yes | `multipart/form-data`, field **`avatar`** (image) | Upload/replace avatar on R2; updates `avatarUrl`. Requires R2 env vars. |
| `DELETE` | `/api/profiles/avatar` | Yes | — | Remove avatar from storage (if configured) and clear `avatarUrl`. |
| `POST` | `/api/profiles/photos` | Yes | `multipart/form-data`, field **`photo`** (image) | Upload a gallery image to R2; **appends** the public URL to `profile.photoUrls`. |
| `GET` | `/api/profiles/user/:userId` | Yes | — | Get another user’s profile by their **User** `_id`. |
| `GET` | `/api/profiles/:id` | Yes | — | Get a profile by **Profile** document `_id` (Mongo `_id` of the profile row). |

> Order matters: `/avatar`, `/photos`, and `/user/:userId` are registered before `/:id` so those paths are not captured as profile IDs.

---

## Browse — `/api/browse`

| Method | Path | Auth | Query | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/browse/` | Yes | Optional: `location`, `interests`, `occupation` | List profiles **except yours**. Filters are optional; `interests` / `occupation` can be comma-separated or repeated query keys. |

---

## Connection requests — `/api/requests`

| Method | Path | Auth | Body / query | Description |
|--------|------|------|--------------|-------------|
| `POST` | `/api/requests/create` | Yes | `{ toUserId }` | Send a connection request to another user (not yourself). |
| `GET` | `/api/requests/` | Yes | `?type=incoming\|outgoing`, `?status=pending\|accepted\|declined` | List requests involving you. Omit `type` for both directions; omit `status` for all statuses. |
| `PATCH` | `/api/requests/respond` | Yes | `{ id, action }` | Update a request by Mongo `_id`. On `action: "accept"`, creates a `Connection`. |
| `DELETE` | `/api/requests/delete` | Yes | `{ id }` | Delete a connection request by Mongo `_id`. |

---

## Connections — `/api/connections`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/connections/` | Yes | — | List all `Connection` documents where you are `userA` or `userB`. |
| `DELETE` | `/api/connections/delete` | Yes | `{ id }` | Delete a connection by **Connection** document `_id`. |

---

## Messages — `/api/messages`

Messaging is only allowed between users who share an active **`Connection`** (same `pairKey` as connections).

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/messages/` | Yes | — | Returns `profileIds` for connected users you can message. |
| `DELETE` | `/api/messages/` | Yes | — | Deletes all messages for every conversation tied to your connections. |
| `GET` | `/api/messages/:otherUserId` | Yes | — | Message history with that user (oldest → newest). **403** if not connected. |
| `POST` | `/api/messages/:otherUserId/photo` | Yes | `multipart/form-data`, field **`photo`** (image) | Upload image to R2; returns `{ url }` to use as `mediaUrl` in `POST .../messages/:otherUserId`. **403** if not connected. |
| `POST` | `/api/messages/:otherUserId` | Yes | `{ text }` and/or `{ mediaUrl }` | Send a message. **403** if not connected. |
| `DELETE` | `/api/messages/:otherUserId` | Yes | — | Deletes the whole conversation with that user (by `pairKey`). **403** if not connected. |

`:otherUserId` is the other person’s **User** `_id`. Invalid IDs → **400**; messaging yourself → **400**.

---

## Quick reference (prefixes)

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, me, password reset, logout |
| `/api/profiles` | Own profile CRUD, avatar, view others by user/profile id |
| `/api/browse` | Discover/filter profiles |
| `/api/requests` | Send/list/respond/delete connection requests |
| `/api/connections` | List/remove accepted connections |
| `/api/messages` | Chat only with connected users |
