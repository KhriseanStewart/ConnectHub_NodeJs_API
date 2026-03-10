# Requests → Connections (Database + API Flow)

This document describes how **connection requests** become **connections** in ConnectHub, and how to model + query them in MongoDB/Mongoose.

## Goals

- Allow a user to send a connection request to another user.
- Support **incoming** and **outgoing** request lists.
- Prevent duplicates (including “A → B” and “B → A” at the same time).
- Accept/decline requests and convert accepted requests into durable connections.
- List and remove connections.

## Collections (Recommended)

### 1) `connectionrequests` (workflow)

Stores the request lifecycle and direction.

**Fields**
- `fromUser` (ObjectId → `User`): sender
- `toUser` (ObjectId → `User`): recipient
- `pairKey` (String): stable key for the pair, regardless of direction
- `status` (String enum): `pending | accepted | declined | cancelled`
- `respondedAt` (Date, optional)
- `createdAt/updatedAt` (timestamps)

**pairKey**

Compute once during request creation:

- `pairKey = [fromUserId, toUserId].sort().join("_")`

This makes A↔B share the same `pairKey` even if the request direction flips.

**Indexes**
- Incoming list: `{ toUser: 1, status: 1, createdAt: -1 }`
- Outgoing list: `{ fromUser: 1, status: 1, createdAt: -1 }`
- Dedup “pending” requests: unique index on `pairKey` **only when status is pending**
  - Use a **partial unique index**: `unique(pairKey) where status == "pending"`

### 2) `connections` (durable relationship)

Stores the long-lived “we are connected” relationship. You already have a `Connection` model with this shape in `models/requests.js`.

**Fields**
- `userA` (ObjectId → `User`)
- `userB` (ObjectId → `User`)
- `pairKey` (String, unique)
- `createdAt/updatedAt` (timestamps)

**Indexes**
- `{ userA: 1, createdAt: -1 }`
- `{ userB: 1, createdAt: -1 }`
- Unique `pairKey` (prevents duplicates)

## Request Lifecycle (State Machine)

- **pending**: created by sender, visible to recipient
- **accepted**: recipient accepts; system creates a `Connection`
- **declined**: recipient declines; no connection created
- **cancelled**: sender cancels before recipient responds

Recommended rule: **only one `pending` request per pair** at any time (enforced via `pairKey` partial unique index).

## API Endpoints (Suggested)

All routes are protected (require auth). Use `req.user.id` as the authenticated user id.

### Send request

`POST /requests`

**Body**
- `toUserId` (required)

**DB rules**
- Reject if `toUserId === req.user.id`
- Reject if a `Connection` already exists for `pairKey`
- Create a `ConnectionRequest` with `status="pending"`
- Rely on the partial unique index to block duplicate pending requests (including reverse-direction duplicates)

**Returns**
- The created request (or a friendly error like “Request already pending” / “Already connected”)

### Incoming requests

`GET /requests/incoming?status=pending`

**Query**
- `status` optional (default `pending`)

**DB query**
- `ConnectionRequest.find({ toUser: req.user.id, status })`

### Outgoing requests

`GET /requests/outgoing?status=pending`

**DB query**
- `ConnectionRequest.find({ fromUser: req.user.id, status })`

### Respond (accept/decline)

`PATCH /requests/:id`

**Body**
- `action`: `accept` or `decline`

**DB rules**
- Only the recipient can respond: request must match `{ _id: id, toUser: req.user.id, status: "pending" }`
- If `accept`:
  - Update request → `status="accepted"`, set `respondedAt`
  - Create `Connection` using the same `pairKey` (unique prevents duplicates)
- If `decline`:
  - Update request → `status="declined"`, set `respondedAt`

**Transaction**
- Optional but ideal: wrap “accept request + create connection” in a Mongo session transaction.

### Cancel outgoing request

`DELETE /requests/:id`

**DB rules**
- Only sender can cancel: match `{ _id: id, fromUser: req.user.id, status: "pending" }`
- Update request → `status="cancelled"` (or delete the request doc if you prefer hard delete)

## Connections

### List connections

`GET /connections`

**DB query**
- `Connection.find({ $or: [{ userA: req.user.id }, { userB: req.user.id }] })`

To return profiles for those connections:
- Collect the “other user ids” from each connection.
- Query profiles: `Profile.find({ user: { $in: otherUserIds } })`

### Remove connection

`DELETE /connections/:otherUserId`

**DB rules**
- Compute `pairKey` from `req.user.id` and `otherUserId`
- Delete the `Connection` by `pairKey`

## Duplicate Prevention Summary

- **Pending request duplicates**: prevented by a **partial unique index** on `ConnectionRequest.pairKey` where `status="pending"`.
- **Connection duplicates**: prevented by a **unique index** on `Connection.pairKey`.
- **Already connected** checks: before creating a request, check if `Connection` exists for the pairKey.

## Recommended Response Shapes

- Requests list endpoints return `{ requests: [...] }`
- Connections list returns `{ connections: [...] }` or `{ profiles: [...] }` depending on what the Flutter app needs.

