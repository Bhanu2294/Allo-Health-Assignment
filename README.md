# Allo Health Inventory Reservation System

## How to Run the App Locally

### 1. Clone the Repository

```bash
git clone <repo-url>
cd allo-inventory
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Set up an app's environment variables in its root's `.env` file.

```env
DATABASE_URL="postgresql://postgres.vtzqhrzxkweivwzlshbj:Bhanu22MIC7154@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

UPSTASH_REDIS_REST_URL="https://right-tarpon-135505.upstash.io"
UPSTASH_REDIS_REST_TOKEN="gQAAAAAAAhFRAAIgcDJmZDJhYzE3ZTQxZDE0OGMwODQ1ZWUwNmQyMDEzOTAwZg"```

---

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev
```

---

### 5. Seed the Database

```bash
npx prisma db seed
```

This will insert a sample of healthcare inventory products and warehouse data.

---

To run the application run the below command

```bash
npm run dev
```

Application will run on:

```text
http://localhost:3000
```

---

## Regenerating in the Expiry Mechanism in Production

Application will follow a lazy approach to ExpireReservations.

Each reservation has:
- `status`
- `expiresAt`

If fetching a reservation using the reservation API:

UPDATED 3I4U backends support checking whether:
- the reservation is still `pending`
- The current time is after the expiration time.

If expired:
- `reservedStock` is decremented
- The status for the reservation record is changed to `released`

The new reservation state is sent back to the client.

This was done by not using:
- background workers
- cron jobs
- queue systems

The reservoir API has been made concurrent using:
- Redis locking
- Prisma database transactions

---

## Trade-offs / Improvements

Limited time budget, hence mainly backend correctness and consistency of reservations are being pursued.

Trade-offs made:
- No up-to-the-minute inventory synchronization between clients
- A WebSocket-based refresh of all stocks is no longer available.
- No cron-based background cleanup service (barrakah, noa, sshd, etal.)
- No implementation for idempotent reservation requests meant for redo operations.No implementation of an idempotent reservation request to be executed by redo.
- Poor UI polishing when compared to the back end implementation

If I had more time I would:
- apply web socket real-time inventory updates
- Add expiry cleanup by cron whenever you like.
- Enhance the observability and structured logging
- make automated integration and concurrency tests
- Enhance UI/UX and responsive design skills



Link to the Deployed Website
https://allo-health-inventory-management-one.vercel.app/