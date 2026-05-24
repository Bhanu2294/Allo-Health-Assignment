# Allo Health Inventory Reservation System

Full stack Inventory Reservation Platform developed with Next.js, Prisma, Supabase PostgreSQL, and Redis.

To simulate a real world multi-warehouse reservation problem and temporarily reserve products during checkout to avoid overselling with multiple transactions.

---

# Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- Upstash Redis
- Tailwind CSS
- Axios
- React Hot Toast

---

# Features

## Inventory Management
- Products and warehouses
This will allow for tracking inventory issued per warehouse.
This allows for the separation of `totalStock` and `reservedStock.This enables the separation of totalStock and reservedStock.

## Reservation System
- Temporary inventory reservation
- Reservation expiry handling
They provide details on the reservations and release.They share reservation details and release.

## Concurrency Handling
- Multi-participant transaction support due to possible simultaneous reservation conflicts – Redis locking for this.
- Transactions between multiple Prisma databases with atomicity

## Frontend
- Product listing page
- Reservation details page
- Live countdown timer
Customers can confirm and cancel their bookings.Customer booking & unsubscription flow
Tighten up error handling, show toast messages.Enhance error handling, set toast messages.

---

# API Endpoints

## Products
### GET `/api/products`
Refunds inventory and stock from the warehouse.

---

## Warehouses
### GET `/api/warehouses`
Returns all warehouses.

---

## Reservations
### POST `/api/reservations`
Makes an inventory reservation for a product and a warehouse.

Returns:
If the item is not in stock, return the following:
An error code indicates that there is an error related to the request for users.If the request for user has an error, it is indicated by the error code.

---

### POST `/api/reservations/:id/confirm`
Confirms a reservation.

Returns:
Further, these letters may contain the following message:

---

### POST `/api/reservations/:id/release`
Removes a reservation and restores stock.

---

# Database Design

## Product
Stores product information.

## Warehouse
Stores warehouse information.

## Inventory
Maintains Stock by each Product and each Warehouse.

Fields:
- `totalStock`
- `reservedStock`

Stock that is available is done dynamically:

```text
availableStock = totalStock - reservedStock