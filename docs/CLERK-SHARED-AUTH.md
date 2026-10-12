# Reuse Ultimate Shopper's Clerk identities for Finance

Both applications use **one existing Clerk production application**:
- Ultimate Shopper (Svelte): `PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Sankey Finance (React/Vite): `VITE_CLERK_PUBLISHABLE_KEY` — set to **exactly the same value**.
- Keep **separate Convex deployments** for the two apps and do not copy finance records into the shopper database.

## Required configuration before publishing

1. In the **existing** Ultimate Shopper Clerk Dashboard, confirm the production instance and enable the Convex integration / `convex` JWT audience if not already enabled. Copy its JWT issuer domain. Do not create a second Clerk application or expose its secret key.
2. In Vercel for **Finance**, set `VITE_CLERK_PUBLISHABLE_KEY` to the exact value of Shopper's `PUBLIC_CLERK_PUBLISHABLE_KEY`; set `VITE_CONVEX_URL` to Finance's Convex deployment URL. Set other existing finance build settings as documented in `.env.example`.
3. In **Finance's** Convex deployment, set:
   - `CLERK_JWT_ISSUER_DOMAIN` = the existing Clerk application's issuer URL (with `https://`).
   - `FINANCE_ALLOWED_CLERK_USER_IDS` = the comma-separated **user IDs** of every Ultimate Shopper user who should access the household financial data, e.g. `user_123,user_456`. Retrieve IDs from Clerk Dashboard → Users. This is deliberately not an email allowlist.
   - Other required finance server-side secrets, e.g. `TOKEN_ENCRYPTION_KEY`.
4. Apply `convex/auth.config.ts` with `npx convex deploy` to Finance's backend. Deploy Finance frontend to Vercel and configure `finance.famocat.cz`.
5. In the existing Clerk application, permit Finance's hostname and restrict allowed subdomains to those actually used.

### Sessions across hostnames

With both apps on subdomains of **the same root domain configured in Clerk**, Clerk supports session sharing by default. If Ultimate Shopper is on a **different registrable domain**, add Finance as an approved satellite domain and configure Clerk's cross-domain sign-in flow instead; simply copying the publishable key is not sufficient for cross-domain SSO.

### Access policy (important)

Clerk authentication verifies a user's identity. The Finance backend has a separate **fail-closed allowlist**. A signed-in user whose Clerk ID is not included in `FINANCE_ALLOWED_CLERK_USER_IDS` is rejected by every financial public query, mutation and action. Missing/empty allowlist also rejects everyone. Multiple allowed users share the existing finance dataset; this is **not** per-user data partitioning.

Do not change this to “allow any signed-in Clerk user”: Ultimate Shopper signs users in on the client, and public registration may be enabled. An account that can sign into Shopper must not automatically gain access to all household banking data without explicit authorization.

### Validation before production

- `npm ci && npm run build && npm run test:auth` in the Finance repository.
- Sign in with **each allowed** existing Ultimate Shopper account, confirm authorized queries work.
- Test signed-out and signed-in but **not allowlisted** accounts; confirm finance Convex queries/mutations/actions reject them directly (not only in UI).
- Test account switching, sign-out and session expiry.
- Verify that no AI endpoint or bank OAuth route bypasses authorization. The former currently run only in Vite development server; the latter are disabled pending CSRF-safe authorization.
- Do not merge the draft PR or expose finance publicly until the production APIs and infrastructure are fully configured.

Clerk docs: https://clerk.com/docs/guides/development/deployment/production
Convex docs: https://docs.convex.dev/auth/clerk
