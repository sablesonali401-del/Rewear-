# ReWear

ReWear keeps the existing HTML/CSS/vanilla JavaScript interface and now uses an Express API backed by Supabase Auth, PostgreSQL, Row Level Security, and Supabase Storage.

## Setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](../supabase/schema.sql) in the Supabase SQL Editor. It creates/updates profiles, clothes, orders, rentals, donations, triggers, indexes, restricted RLS policies, secure database functions, and the public `clothes` storage bucket. It accepts `Sell`, `Rent`, and `Donate` listing types and preserves existing product data.
3. For local development, copy `.env.example` to `.env` in the project root and set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

The anon key is used by the API with RLS enabled. The service-role key is optional and used only for the existing admin user-deletion/profile-recovery operations; never put it in `ReWear/` or frontend JavaScript. Never commit `.env`; `.gitignore` excludes it.

4. Create the separate owner account using the normal registration page. It is created as a Customer. After registering and confirming the account, promote only the intended owner in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'owner', updated_at = now()
where lower(email) = lower('owner@example.com');
```

Replace the example address with the owner's registered email and confirm the affected row before continuing. Registration data, browser storage, user metadata, and API request fields cannot assign the Owner role. Review any existing `owner` profiles when migrating from the previous email-based setup; demote accounts that are not authorized.

5. Install and run locally:

```powershell
cd c1
npm.cmd install
npm.cmd start
```

Open `http://localhost:3000`. Do not open the HTML files directly because API and storage requests need the Express origin.

## Deploy to Render

The included [`render.yaml`](../render.yaml) configures a Node web service, `npm ci` build, `npm start`, and `/api/health` health check.

1. Make sure the project folder (`c1_2/c1`, containing `render.yaml`) is pushed to a GitHub repository. Do not push `.env`, passwords, or private keys.
2. In Render, choose **New → Blueprint**, connect the repository, and select the `render.yaml` file if prompted. If the repository contains this project in a subfolder, set the Render service's Root Directory to that folder.
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Render environment variables. `SUPABASE_SERVICE_ROLE_KEY` is optional; only add it if using server-side admin user deletion/profile recovery. Never use a frontend-prefixed variable for it.
4. In Supabase, run the current [`supabase/schema.sql`](../supabase/schema.sql) in the SQL Editor if it has not already been applied.
5. In Supabase **Authentication → URL Configuration**, set the deployed Render URL as the Site URL and add the deployed URL to the allowed redirect URLs. Also add your custom domain when configured.
6. Wait for Render's deploy and `/api/health` check. Open the Render URL, register a customer, then verify registration/login, image upload, owner approval, and refreshed status on the customer dashboard.

Render supplies `PORT`; do not hardcode a production port. The frontend uses same-origin `/api` requests when served over HTTP(S), so it works with Render's generated domain and custom domains without rebuilding.

**Credential hygiene:** `.env.example` contains placeholders only. If a service-role key was ever committed to GitHub or otherwise shared, rotate it in Supabase before deploying. The service-role key bypasses RLS and must remain server-side.

## Real Workflows

- Registration always creates Customer accounts. Owner access comes only from the protected `profiles.role` database value, assigned administratively in Supabase; it is not inferred from an email or frontend flag.
- Login stores only the Supabase access token and profile session locally; passwords are never stored by ReWear.
- Clothing uploads validate JPG/PNG/WEBP under 5MB, upload to Supabase Storage, and store only the path/URL plus product metadata in PostgreSQL.
- New listings start as `Pending`. Customers can see and edit their own listings, but cannot set the review status, availability, or inventory owner. The owner dashboard loads all customer listings and status changes are checked by the API and a restricted database function.
- Sell, Rent, and Donate are listing types on the shared `clothes` table. The Owner Dashboard's Sell/Rent/Donate tabs filter those submissions; Donate listings also create a row in `donations` automatically. `rentals` stores customer rental bookings after an approved Rent listing is requested.
- The Customer Dashboard has separate Sell/Rent/Donate listing tabs. Donate status is read from `donations`; Sell and Rent review status is read from `clothes`. Rental request status is shown separately from the rental listing review status. The dashboard refreshes its Supabase-backed status tables every 15 seconds and when it regains focus.
- Only `Approved` and `Available` products are exposed in the public shop. `Sold` is an availability value, separate from the review status (`Pending`, `Approved`, or `Rejected`).
- Orders, rentals, profile edits, approvals, and inventory changes use REST endpoints, transaction-safe database functions, and RLS-backed Supabase queries. Product/user data shown in the app is refreshed from Supabase; browser storage is only a session/cache, not the database.

## Verification Checklist

1. Register a Customer, log in, upload a clothing image, and confirm the row appears in `clothes` and the object appears in Storage.
2. Register the separate owner account, promote its database profile as above, log in, and confirm submissions from both customers appear in the Owner Dashboard with their real images.
3. Log out, log in again, and refresh; the session and database records should remain available.
4. Use two customer accounts and verify each customer dashboard shows only its own uploads/statuses. Confirm a customer request attempting to set `status`, `availability`, or `ownerId` fails.
5. Approve/reject a listing as Owner, refresh both dashboards, and confirm the saved status is reflected. Check that only Approved/Available listings appear in the shop.
6. Submit one listing of each type. Verify Donate appears in the donation records, Sell and Rent appear under their respective Owner Dashboard tabs, and approved Rent listings offer a rental request rather than a purchase.

## Notes

Existing page layouts, styles, forms, cards, navigation, and render markup are retained. Local-only account creation/login and demo product/transaction seeding are disabled. The old destructive admin demo-reset control is disabled because live database data must not be cleared from the browser.
