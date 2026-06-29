# Mangalik — E-Commerce Platform + Dashboard

A-Z Poojan Samagri e-commerce platform. Single unified Express.js backend
serving two separate React frontends: the customer storefront and the
role-based backend-team dashboard.

## Architecture

```
mangalik/
├── backend/                  Single Express.js + MongoDB API (serves both frontends)
│   ├── src/
│   │   ├── config/           db, firebase admin, roles/permissions matrix
│   │   ├── models/            Mongoose schemas (User, Product, Order, PlatformSettings, ...)
│   │   ├── middleware/        security stack, auth (JWT+Firebase), RBAC, platform kill-switch
│   │   ├── controllers/       business logic per resource
│   │   ├── routes/            REST endpoints, namespaced per role/module
│   │   ├── services/          Razorpay payment integration
│   │   ├── sockets/            Socket.io (live tracking, support chat)
│   │   └── utils/             logger, error classes, encryption, seed script
│   └── scripts/obfuscate.js   production build-time code obfuscation
│
├── frontend-user/            Customer storefront — React + Redux Toolkit + MUI
│   └── src/
│       ├── theme/             Bhagwa (Saffron) + White + Z-Black brand theme
│       ├── redux/             auth, cart, products, ads slices
│       ├── components/        layout, product (incl. AddOnSelector), AdsBanner, RouteGuard
│       └── pages/             Home, Products, Cart, Checkout, Terms, FAQs, About, Contact, etc.
│
└── frontend-dashboard/       Backend-team dashboard — React + MUI (role-templated)
    └── src/
        ├── utils/navConfig.js   role → navigation registry (the "templating engine")
        ├── components/layout    single shell reused by every role
        └── pages/
            ├── superadmin/       Platform Control, Billing Enforcement, Ads/AdSense Keys,
            │                     Feature Flags, User Management, Audit Logs
            ├── admin/            Catalog, Orders, Vendors, Staff, CMS
            ├── manager/, vendor/, agent/, deliveryPartner/, salesPartner/
```

## Roles & access model

`superadmin` (Aditya Tech & Devoops / platform owner) → `admin` (client/business
owner) → `manager` → `vendor` / `agent` / `salesPartner` / `deliveryPartner` → `user`.

Authorization is **permission-based**, not role-name based (see
`backend/src/config/roles.js`), and enforced server-side on every route —
the dashboard's client-side `RoleGuard` is UX convenience only. SUPERADMIN
holds an exclusive `/api/superadmin/*` namespace, completely inaccessible
to `admin`, covering:

- Global kill-switch (disable entire platform instantly)
- Per-feature flags (checkout, COD, Razorpay, ads, vendor portal, ...)
- Per-route disablement
- Billing enforcement tied to client payment dues
- Google AdSense keys + custom banner overrides, per ad slot
- User/account suspension (including suspending the ADMIN account itself)
- Immutable audit log of every sensitive action

## Security stack

Helmet (CSP/HSTS), CORS allow-list, HPP, Mongo-sanitize, XSS-clean,
bcrypt password hashing, JWT access+refresh tokens (httpOnly refresh
cookie), Firebase ID-token verification, rate limiting + progressive
slow-down (DDoS/brute-force mitigation), Razorpay HMAC signature
verification on both checkout callback and webhooks, AES-256 field
encryption helper for sensitive data, and build-time JavaScript
obfuscation (backend `npm run obfuscate`, both frontends' production
Vite builds) so deployed code cannot be trivially read or tampered with.

## Getting started

```bash
# Backend
cd backend && cp .env.example .env   # fill in real secrets
npm install
npm run seed     # creates PlatformSettings, default CMS pages, categories, superadmin
npm run dev

# Customer storefront
cd frontend-user && cp .env.example .env
npm install && npm run dev

# Dashboard
cd frontend-dashboard && cp .env.example .env
npm install && npm run dev
```

## Production Deployment & SSL

Mangalik is architected to run behind a reverse proxy (like NGINX) or an edge CDN (like Cloudflare) which handles SSL termination and routing.

1. **Obfuscation**: Run `npm run build` in both `webClient` and `dashboard`. The `vite-plugin-obfuscator` will automatically encrypt and obfuscate the output JavaScript, making it hack-resistant.
2. **Reverse Proxy (NGINX)**:
   - Route `mangalik.store` to port `3000` (WebClient built statics).
   - Route `dashboard.mangalik.store` to port `3001` (Dashboard built statics).
   - Route `api.mangalik.store` to port `5000` (Express Backend).
3. **SSL Certificates**:
   - Install **Certbot** on your Linux server: `sudo apt install certbot python3-certbot-nginx`
   - Run `sudo certbot --nginx -d mangalik.store -d www.mangalik.store -d api.mangalik.store -d dashboard.mangalik.store`
   - Certbot will automatically configure the SSL certificates, fulfilling the secure server requirement.

## Notes

- Domain: `www.mangalik.store` (a `.store` TLD is typically the most
  cost-effective option for an e-commerce brand named "Mangalik";
  `.shop` and `.in` are reasonable lower-cost alternatives to compare
  at registration time).
- This scaffold is production-architected but ships with representative
  implementations for each module — extend CMS content, product seed
  data, vendor payout automation, and analytics dashboards as the
  catalog and client requirements grow.
