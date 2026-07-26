# Dashboard Architecture & Layout Implementation Plan

This plan details the implementation strategy for creating the 3 role-based React dashboards in the `dashboard` directory, the `superAdmin` Server Management EJS dashboard in the `backend`, and the `Lifeline` tracking interface.

## User Review Required

> [!WARNING]
> **Pending Answers:** Thank you for providing the Lifeline image. It is very helpful! Before I begin generating the code, I still need answers to the following questions:
> 1. **Revenue OS Integration:** Should the `Revenue_OS` (currently a separate directory) be merged into the main React `dashboard` application, or remain a separate application that we simply link to?
> 2. **EJS Backend Setup:** Do you want the EJS Server Management dashboard to be served from the exact same Express server instance (e.g., via `/server-admin` routes), or should it be a separate microservice?
> 3. **UI Library:** We need to build complex charts and UI elements. Do you have a preferred charting library (e.g., Chart.js, Recharts) and UI component library (e.g., TailwindCSS, Material-UI) for the React dashboards?

## Proposed Changes

### `dashboard` (React App)
- Restructure routing to support role-based layouts (`/operations`, `/vendors`, `/logistics`).
- **Authentication/Role Context:** Create a React Context or Redux slice to manage the logged-in user's role and conditionally render the default layout.
- **SuperAdmin Role Switcher:** Add a global dropdown component visible only to `superAdmin` allowing them to mock/switch their view to any other role.
- **Operations Dashboard (Admin/Manager/Agent):**
  - Implement components for User Count, Sales Graphs, Segmented Reports.
  - Create Order/Inventory/Catalogue management tables.
  - Implement Ticket Management UI.
  - Implement AI Chat Bot "Laxmi" interface widget.
- **Vendor Dashboard (Seller Central):**
  - Implement Vendor Commission Reports, Excel Export.
  - Build Vendor QR Code Generation interface.
- **Logistics Dashboard (XpressD):**
  - Implement order tracking and assignment tables.
- **Lifeline Route (`/lifeline`):**
  - Create dynamic routes supporting queries like `?orderId=...`, `?vendorId=...`, `?vendorCode=...`.
  - Replicate the Zomato-style tracking template provided in the image:
    - **Header:** Order ID, Dates, Call Logs, Help.
    - **Info Cards Grid:** Customer Info, Merchant/Vendor Info, Delivery Partner Info, and a Map/Status widget.
    - **Timeline:** Order Progress horizontal timeline (Placed -> Packed -> Picked -> Arrived -> Delivered) with delay indicators.
    - **Actions Sidebar:** "Report An Issue" and "Quick Actions" panel.
    - **Comments:** Internal comments section for the support team.
  - Implement lazy loading (3 recent orders) with a "Load More" button.

### `backend` (Express App)
- **EJS Integration:** Install `ejs` and configure Express to use it as the view engine.
- **SuperAdmin Routes:** Create protected routes (e.g., `/admin/server-logs`, `/admin/security`) that render EJS templates.
- **EJS Templates:** Design templates for server logs, errors, usage stats, and attack logs.
- **API Endpoints:** Build/extend APIs required for the React dashboards (Sales stats, Segment reports, Ticket management, QR generation).

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- Log in as `superAdmin` and verify the ability to toggle between Operations, Vendor, and Logistics layouts.
- Log in as `admin`/`manager` and verify access is restricted to Operations.
- Navigate to the EJS server management routes and verify they load and are restricted.
- Test the `/lifeline` search route with mock Order IDs and verify the lazy-loading functionality and UI layout matches the sample.
