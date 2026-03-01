# Dionisos MVP

Bottle passports + cellar storage entitlement + experiences pass, backed by NFTs on **Base** with an official rule-enforced marketplace.

## Project ledger (frozen defaults)
- Chain: Base (EVM L2)
- Tokens: ERC-721 for premium bottles; ERC-1155 for cases/batches
- Marketplace: official marketplace with optional rules (max price, buyer allowlist, cooldown)
- Payments: native ETH and a BTC-backed ERC-20 on Base ("wrapped BTC")
- Gas: users pay gas for trades/transfers
- Off-chain: events, storage, attestations, custody timeline
- UX: email/OAuth login for read-only; wallet-connect only when needed
- **Demo Mode**: Fully functional demo with seeded data (10 passports, 5 events, 5 marketplace listings) for immediate testing without DB/wallet setup

## Monorepo
- `apps/web` — Next.js app (UI + public passport view + API stubs)
- `packages/shared` — shared Zod schemas + types
- `packages/contracts` — Foundry smart contracts (membership, passports, marketplace)
- `supabase/` — database schema migrations

## Prerequisites
- Node.js >= 20
- pnpm
- Foundry (for contracts)

### Quick install on macOS (if commands are missing)
If you see `command not found: pnpm` or `command not found: corepack`, install Node and pnpm:

```bash
# Install Homebrew (only if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node (must be >= 20)
brew install node

# Install pnpm globally
npm install -g pnpm
```

Verify:
```bash
node -v
pnpm -v
```

## Local dev

```bash
pnpm install
pnpm dev
```

Open:
- `http://localhost:3000` — Home dashboard with navigable sections
- `http://localhost:3000/passports` — Browse 10 demo bottle passports
- `http://localhost:3000/passport/demo-tag` — Example passport detail with custody & attestations
- `http://localhost:3000/events` — Events list with tier gating (5 demo events)
- `http://localhost:3000/marketplace` — Marketplace with rule-enforced listings (5 demo listings)

API:
- Health: `http://localhost:3000/api/health`
- Public passport JSON: `http://localhost:3000/api/public/passport/demo-tag`

### Demo Mode (default)
**By default, the app runs in Demo Mode** with fully seeded data and no external dependencies. This lets you test the entire app flow immediately:
- ✅ 10 diverse bottle passports (ERC-721 + ERC-1155)
- ✅ Custody timeline and signed attestations
- ✅ 5 events with tier-based access gating (Access/Cellar/Patron)
- ✅ 5 marketplace listings with on-chain rules (max price, allowlist, cooldown)
- ✅ Complete reservation and purchase flows (mock, no wallet needed)

Demo Mode is active when:
- Supabase is NOT configured (no `NEXT_PUBLIC_SUPABASE_URL`), OR
- `DEMO_MODE=true` is set in `.env.local`

To force DB mode: set `DEMO_MODE=false` in `.env.local` (requires Supabase setup).

### Supabase (optional, for DB-backed passports and partner tools)
**Supabase is optional.** If you don't configure it, the app runs in Demo Mode with seeded data.

Configure Supabase to enable:
- Real passport data from Postgres
- Partner portal (`/partner`) for creating passports, logging custody, and signing attestations
- User authentication (sign-in, reservations with user accounts)

Setup:
1) Create a Supabase project (free tier)
2) Run migrations in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_partner_roles.sql`
3) Copy `apps/web/.env.example` to `apps/web/.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (optional, server-only) `SUPABASE_SERVICE_ROLE_KEY`
- Set `DEMO_MODE=false` if you want to force DB mode

Then restart dev server.

### Partner setup (MVP)
Partner tools live at `/partner` and require a Supabase-authenticated account.

Create a partner + membership via SQL editor (admin action):

```sql
insert into partners (name, kind) values ('Demo Winery', 'winery') returning id;

-- Replace <AUTH_USER_ID> with the UUID from Supabase Auth Users table
-- Replace <PARTNER_ID> with the id returned above
insert into partner_users (user_id, partner_id, role)
values ('<AUTH_USER_ID>', '<PARTNER_ID>', 'admin');
```

Now sign in at `/login`, open `/partner`, select your partner, then:
- create a passport for a `tagId`
- log custody check-in/out
- create a signed attestation (requires a browser wallet like MetaMask)

### Sign-in (optional)
If Supabase auth is configured, a `Sign in` link appears in the header (`/login`).
MVP auth is used later for reservations and partner workflows.

## Contracts

```bash
pnpm -C packages/contracts setup
pnpm -C packages/contracts test
```

## Test checklist (smoke tests)

### Demo Mode (no setup required)
- [ ] `pnpm dev` starts without errors
- [ ] Home page loads at `http://localhost:3000` with demo mode banner
- [ ] `/passports` shows 10 different bottles (ERC-721 + ERC-1155 mix)
- [ ] `/passport/demo-tag` shows bottle details + custody timeline + attestations
- [ ] `/passport/TAG-001-2022` shows a different bottle (verify data varies)
- [ ] `/events` shows 5 events with tier badges
- [ ] Selecting different tiers (Access/Cellar/Patron) correctly shows/hides locked events
- [ ] `/events/evt-001-harvest` allows reservation (mock, no wallet)
- [ ] After reservation, check-in QR/code is displayed
- [ ] `/marketplace` shows 5 listings with rule badges (max price, allowlist, cooldown)
- [ ] `/marketplace/list-001` shows listing detail + purchase flow (mock, no wallet)
- [ ] After purchase, success message + tx hash displayed
- [ ] `/api/public/passport/demo-tag` returns valid JSON (200)
- [ ] `/api/health` returns `{ ok: true, ... }`
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` completes successfully

### Supabase Mode (requires DB setup)
- [ ] With Supabase configured: creating a `passports` row makes `/passport/<tag_id>` resolve from DB
- [ ] With partner setup: `/partner` can create a passport row with `issuer_partner_id` set
- [ ] With wallet connected: `/partner` can sign + submit an attestation (server verifies signature)
- [ ] Partner portal shows authenticated user and partner selection

## Notes on BTC payments
Base is an EVM chain; BTC payments on-chain are supported via a BTC-backed ERC-20 deployed on Base (commonly called "wrapped BTC" / WBTC-like).
The marketplace contract supports native ETH and any whitelisted ERC-20 payment token.

## Marketplace protocol fee
The marketplace includes an optional protocol fee (default **0 bps**) routed to a treasury address.
This is off by default; enable only after review.
