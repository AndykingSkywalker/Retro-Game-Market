Nope # Retro Game Market

A learning-focused e-commerce frontend built with **Next.js**, **React**, and **TypeScript** for browsing and managing a retro video game store.

This project is designed to sit in front of a **Spring Boot + MySQL + JWT** backend and gave me a way to learn the Next.js App Router, TypeScript, client-side state management, and frontend/backend integration in a real project.

## Project Overview

Retro Game Market is a storefront for classic games and consoles. It supports:

- a guest landing page for first-time visitors
- featured sale items on the homepage for signed-in users
- a full product catalogue with filtering
- login and registration flows
- a profile area with editable account details and profile image
- a basket drawer and checkout page
- an admin inventory page for managing products

The frontend is intentionally structured to be beginner-friendly, with a simple typed API layer, shared app state, and reusable UI components.

## Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **ESLint**

### Backend Integration

This frontend expects a separate backend API, currently designed around:

- **Java Spring Boot**
- **MySQL**
- **JWT authentication**
- **Swagger / OpenAPI** for API reference

## Core Features

### Guest Experience

- Landing page on `/` for unauthenticated visitors
- Clear sign-in and sign-up call to action
- Clean entry layout without the full storefront shell

### Customer Experience

- Featured on-sale products on the homepage
- Product browsing with filters for:
  - genre
  - console
  - on-sale only
- Basket drawer available across the app
- Checkout page with basket summary
- Profile page for editing:
  - username
  - email
  - password
  - profile picture preview

### Admin Experience

- Admin-only inventory page
- Search and filter existing items
- Update item fields such as:
  - name
  - console
  - genre
  - stock level
  - price
  - image URL
  - in-stock status
  - on-sale status
- Create new products from the frontend

### UI / UX Work Included

- Light and dark theme toggle
- Icon-based navigation
- Animated profile dropdown
- Accessible theme-aware controls
- Dev-only terminal for quick debugging commands such as `getRole`

## Current Routes

| Route | Purpose |
| --- | --- |
| `/` | Guest landing page or featured sale items for signed-in users |
| `/products` | Full product catalogue with filters |
| `/login` | Sign in page |
| `/register` | Create account page |
| `/profile` | Account settings and profile image |
| `/cart` | Checkout / basket summary |
| `/admin` | Admin-only inventory management |

## Project Structure

```text
src/
  app/
    admin/
    cart/
    login/
    products/
    profile/
    register/
    globals.css
    layout.tsx
    page.tsx
  components/
    AppShell.tsx
    CartDrawer.tsx
    CartItem.tsx
    DevTerminal.tsx
    NavBar.tsx
    ProductCard.tsx
    StoreProvider.tsx
    ThemeToggle.tsx
  lib/
    api.ts
    auth.ts
  types/
    cart.ts
    product.ts
    user.ts
```

### Key Files

- `src/lib/api.ts` - typed fetch helpers for the backend API
- `src/lib/auth.ts` - local session/token helpers
- `src/components/StoreProvider.tsx` - shared app state for auth, basket, and profile actions
- `src/components/NavBar.tsx` - main navigation, account dropdown, admin entry point
- `src/components/CartDrawer.tsx` - fixed basket drawer UI
- `src/app/page.tsx` - guest landing page + signed-in homepage logic

## Local Setup

### Prerequisites

- **Node.js 20+**
- the backend API running locally
- backend available at `http://localhost:8088` unless you change the environment variable below

### Environment Variables

Create a local environment file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8088
```

An example is also included in:

- `.env.example`

### Install and Run

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js may move to another available port.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy Frontend With Docker

This repository includes a production `Dockerfile` and `docker-compose.yml` for the frontend.

### 1) Configure environment

Set the API URL your frontend should call (or keep the default):

```bash
cp .env.example .env
```

Update `.env` if needed:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8088
```

### 2) Build and run the container

```bash
docker compose up --build -d
```

### 3) Verify

Open:

```text
http://localhost:3000
```

Check logs:

```bash
docker compose logs -f frontend
```

Stop when done:

```bash
docker compose down
```

## Authentication Notes

This project currently uses a simple client-side approach for learning purposes:

- JWT token is stored in `localStorage`
- role is stored in `localStorage`
- authenticated user data is hydrated on the client through the shared store

This is acceptable for a learning project, but for production you would usually move toward a more secure cookie/session-based approach.

## Accessibility and UI Notes

The UI has had an accessibility-focused pass including:

- improved contrast in light/dark modes
- keyboard-friendly controls
- visible focus states
- automated checks on key routes during development

## Known Limitations

- checkout is currently a placeholder flow
- profile image is client-side only and stored locally in the browser
- auth state is managed in `localStorage`
- no order history or payment integration yet
- the frontend currently assumes the backend API shape already exists

## Why This Project Exists

This project is part storefront and part learning exercise.

The goal was to build something practical while learning:

- the **Next.js App Router**
- **TypeScript** in a real application
- frontend state management with React hooks and context
- API integration with a Spring Boot backend
- role-based UI for customer/admin experiences

## Next Steps

Possible next improvements:

- persist basket state more robustly
- add order placement and order history
- upload profile images to the backend instead of local storage
- improve mobile navigation further
- add automated tests
- improve route protection for authenticated and admin-only areas

## Backend Reminder

This repository is the **frontend only**.

It expects a compatible Spring Boot backend with JWT auth and item/cart/user endpoints.
