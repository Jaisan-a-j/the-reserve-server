# The Reserve API

REST API powering [The Reserve](https://github.com/Jaisan-a-j/the-reserve-client) — a full-stack restaurant platform with authentication, table bookings, online ordering, reviews, and an AI chatbot.

**Frontend:** [the-reserve-client](https://github.com/Jaisan-a-j/the-reserve-client)  
**Live Demo:** [thereserve-restaurant.store](https://www.thereserve-restaurant.store)

---

## Tech Stack

- **Runtime** — Node.js 20, TypeScript
- **Framework** — Express 5
- **Database** — MongoDB with Mongoose
- **Auth** — JWT, bcrypt, Google OAuth (`google-auth-library`)
- **Email** — Resend API
- **AI** — Google Gemini (`@google/genai`) with Groq (`groq-sdk`) fallback
- **Deployment** — Docker, Docker Hub, Render, GitHub Actions CI/CD

---

## API Overview

Base URL (local): `http://localhost:5000`

All protected routes require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register user, send OTP email |
| POST | `/verifyotp` | No | Verify OTP and return JWT |
| POST | `/login` | No | Login with email/password |
| POST | `/google` | No | Google OAuth login/register |
| POST | `/user` | Yes | Get current user |
| PUT | `/profile` | Yes | Update delivery address (address, city, pinCode) |

---

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create table booking |
| GET | `/me` | Yes | Get user's active bookings |
| GET | `/available-slots?date=YYYY-MM-DD` | No | Get booked time slots for a date |
| DELETE | `/:id` | Yes | Cancel a booking |

**Booking rules:**
- Max 2 active bookings (pending or confirmed) per user
- Only 1 booking allowed per date per user
- Available slots: 09:00 AM, 11:00 AM, 01:00 PM, 03:00 PM, 05:00 PM, 07:00 PM

---

### Food — `/api/food`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List food items (supports filters + pagination) |
| GET | `/price-range` | No | Get min/max menu prices |
| GET | `/best-sellers` | No | Top items by order quantity (aggregation) |
| GET | `/chef-specials` | No | Items flagged as chef specials |
| GET | `/new-arrivals` | No | Items added in the last 48 hours |
| GET | `/trending` | No | Top items ordered in the last 48 hours |


**Query filters for `GET /`:** `page`, `limit`, `category`, `dietary`, `spice`, `minPrice`, `maxPrice`

---

### Cart — `/api/cart`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get populated cart items |
| POST | `/` | Yes | Add item (`foodId`, `quantity`) |
| PATCH | `/:foodId` | Yes | Update item quantity |
| DELETE | `/:foodId` | Yes | Remove item from cart |

Cart is stored on the user document in MongoDB and populated with food details on read.

---

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Place order from cart |
| GET | `/me` | Yes | Get user's order history |

**Order pricing:**
- Service fee: ₹4.99
- Delivery fee: ₹6.50 (delivery only)
- Tax: 5% of subtotal

**Fulfillment:** `delivery` or `pickup`  
**Payment:** `card` or `counter`

Placing an order clears the user's cart and sends a confirmation email via Resend.

---

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Submit review (`rating` 1–5, `comment`) |
| GET | `/` | No | Get all reviews (newest first) |

---

### Chat — `/api/chat`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | No | Send message to AI assistant (`message`) |

Uses Google Gemini as the primary provider. Falls back to Groq (Llama 3.3 70B) if Gemini is unavailable.

---

## Data Models

| Model | Purpose |
|-------|---------|
| **User** | Auth, profile, embedded cart |
| **Food** | Menu items with category, dietary tags, spice level |
| **Booking** | Table reservations with status (pending, confirmed, cancelled) |
| **Order** | Order items, contact, fulfillment, pricing breakdown, status |
| **Review** | User ratings and comments |

---

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone and install

```bash
git clone https://github.com/Jaisan-a-j/the-reserve-server.git
cd the-reserve-server
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/the-reserve

# Auth
JWT_SECRET=your_jwt_secret_key

# Google OAuth (must match frontend Google Client ID audience)
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key

# AI Chatbot
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Run the server

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at `http://localhost:5000`.

---

## Docker

Build and run with Docker:

```bash
docker build -t the-reserve-backend .
docker run -p 5000:5000 --env-file .env the-reserve-backend
```

---

## Deployment

The backend is deployed via **GitHub Actions → Docker Hub → Render**:

1. Push to `main` triggers CI
2. Docker image is built and pushed to `jaisanaj/the-reserve-backend`
3. Render deploy hook pulls the latest image

Workflow file: `.github/workflows/backend-ci.yml`

---

## Project Structure

```
src/
├── config/         # MongoDB connection
├── controllers/    # Route handlers (auth, booking, cart, food, order, review, chat)
├── middleware/     # JWT auth middleware
├── models/         # Mongoose schemas (User, Food, Booking, Order, Review)
├── routes/         # Express route definitions
├── utils/          # Auth helpers, email, AI, order pricing, validation
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

---

## Security Notes

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire after 30 days
- Protected routes validated via `authMiddleware`
- OTP expires after 5 minutes
- Order requests validated before processing (`validateOrderRequest`)

---

## Related Repository

| Repo | Link |
|------|------|
| **Frontend** | [github.com/Jaisan-a-j/the-reserve-client](https://github.com/Jaisan-a-j/the-reserve-client) |

---

## Author

Backend for The Reserve — a portfolio project demonstrating REST API design, MongoDB modeling, third-party integrations (OAuth, email, AI), and production deployment with Docker and CI/CD.
