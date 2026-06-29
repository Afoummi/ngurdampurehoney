## Goal

Redesign every surface of the Ngurdam Honey site to feel like a premium Nigerian honey brand and a modern SaaS admin — without breaking any working feature, security rule, or the WhatsApp checkout flow.

## Brand & Design System

**Palette (HSL tokens in `index.css`)**
- `--forest`: 150 45% 14% (deep forest green, primary surface accents)
- `--forest-deep`: 155 50% 9% (footer / sidebar bg)
- `--honey`: 42 88% 52% (honey-gold, primary CTA)
- `--honey-soft`: 45 90% 65%
- `--cream`: 40 45% 96% (page bg light)
- `--ink`: 150 20% 12% (body text)
- `--muted`: 40 15% 92%
- Update both `:root` and `.dark`; map shadcn semantic tokens (`--primary`, `--background`, etc.) to these.

**Typography**
- Install `@fontsource/instrument-serif` + `@fontsource/work-sans` via `bun add`, import in `main.tsx`.
- `--font-display: 'Instrument Serif'` (headings, large numerics)
- `--font-body: 'Work Sans'` (UI + body)
- Update `tailwind.config.ts` fontFamily and remove old Playfair/DM Sans imports from `index.css`.

**Component primitives**
- Rounded `xl` (16px) for cards, `2xl` for hero panels, `lg` for inputs/buttons.
- Soft shadows: `--shadow-card`, `--shadow-lift` defined as HSL-based tokens.
- New Button variants: `honey` (gold gradient), `forest` (dark), `outline-cream`.
- Tighten spacing scale; consistent section padding `py-20 md:py-28`.

**Accessibility pass**
- All text ≥ AA contrast; replace any `text-white/70` style faded text with token-based muted.
- Icon-only buttons get `aria-label`.
- Single `<main>` per route; H1 once per page.
- Forms: visible labels, error text in `text-destructive`, focus-visible rings.

## Imagery

Generate ~10 premium photographic images via `imagegen` (standard tier, JPG) and store under `src/assets/photos/`:
1. Hero: honey pouring from dipper, dark moody background
2. Honeycomb close-up with bees
3. Jar lineup on rustic wood
4. Honey drip on cream surface
5. Farm/apiary scene
6. Single jar product photo (cream bg)
7. Health/wellness lifestyle (honey + tea)
8. About story image (beekeeper hands)
9. Testimonial section backdrop
10. Footer/CTA band

Externalize via `lovable-assets create` to keep repo light. Replace emoji 🍯 / clipart usages across HeroSection, FeaturesSection, CTASection, Footer, ProductCard fallback, Auth page. Keep lucide icons for functional UI only.

## Storefront Pages

**Homepage (`src/pages/Index.tsx` + components)**
- New `HeroSection`: large photographic split, headline in Instrument Serif, honey CTA, trust badges row.
- `FeaturedProducts`: existing ProductGrid wrapped in elevated section with "View all" CTA.
- `WhyChooseSection` (new): 4 value props with icons + photo collage.
- `HealthBenefitsSection` (new): 6 benefit cards with subtle photo accents.
- Keep existing `TestimonialsSection` — restyle to card carousel feel.
- New `FAQSection` using shadcn Accordion (8 Q&As about purity, shipping, storage).
- New `ContactCTASection` with address/phone/email + map placeholder.
- New premium `Footer` (see below).

**Products / Product Detail**
- Larger product cards: photo aspect-square, size badge, ₦ price, stock pill, quick add.
- ProductDetail: 2-col layout — gallery left (main + thumbs), info right (title, price, size selector, qty stepper, Add to Cart, trust badges, accordion for description/shipping/storage), Similar Products row below.
- Skeleton loaders on data fetch.

**Auth / Account / Track Order** — restyle to match tokens, no logic changes.

**Checkout (`Checkout.tsx`)** — keep WhatsApp flow exactly. Redesign as 2-col: left = form (Name, Phone, Address, State, City) with grouped fieldsets and validation; right = sticky order summary card with line items, subtotal, delivery note, and prominent "Send Order via WhatsApp" honey button. Remove any Paystack remnants from UI (keep edge function file untouched if present).

**Order Confirmation** — premium success card with order ref, items, WhatsApp link, contact details.

## Footer (used site-wide)

Brand block (NGURDAM HONEY logo + AB SARDAUNA NGURDAM VENTURES tagline), Quick Links, Customer Service (Track Order, Shipping, Returns, FAQ), Contact (Arkilla Area, Behind Alkanci Plaza, Wamakko LGA, Sokoto State / 07019253574, 08035890705 / ngurdamhoney@gmail.com), Newsletter form, Social placeholders. Legal row: Privacy Policy, Terms, © year.

Add stub pages: `/privacy`, `/terms` with simple legal templates.

## Admin Dashboard — Full SaaS Rebuild

Replace tab-based `pages/admin/Dashboard.tsx` with a shell using shadcn `Sidebar`:

**Layout**
- `AdminLayout` with collapsible icon sidebar (forest-deep bg, honey active indicator), top bar with breadcrumb + search + user menu, `<Outlet />` content area on cream bg.
- Nested routes under `/admin/*`: `overview`, `orders`, `products`, `categories`, `inventory`, `customers`, `newsletter`, `promos`, `analytics`, `reports`, `settings`, `users`, `security`.

**Overview page**
- 8 KPI cards (Total Orders, Revenue ₦, Products, Customers, Pending, Completed, Cancelled, Out of Stock) — each with icon, value, delta.
- Recharts: Monthly Sales (area), Orders by status (bar), Revenue trend (line), Customer Growth (line). Data from existing tables via supabase queries.
- Recent Orders table (5 rows) + Low Stock list.

**Tables (Orders, Products, Customers, Newsletter, Promos, Users)**
- Shared `DataTable` component: search input, column filters, sortable headers, pagination, status badges, row actions, bulk action bar (select-all checkbox + delete/export).
- Export CSV button per table.

**New sections**
- `Categories`: new `categories` table (id, name, slug, description) + product.category_id FK. Full CRUD UI. Migration required.
- `Analytics`: dedicated charts page (traffic placeholder, sales breakdown by size/category, top products).
- `Reports`: date-range picker, downloadable CSV reports (orders, revenue, inventory snapshot).
- `Security`: read-only view of recent auth events from `user_roles` + edge function logs summary + active admin/moderator list + RLS status badges (informational, no mutations beyond role assignment which already exists).

**Forms** — modern shadcn Form with react-hook-form + zod, inline validation, loading spinners, sonner success toasts, drag-and-drop image upload for products (Supabase Storage bucket `product-images`, public read).

**Moderator dashboard** — reuse `AdminLayout` but restrict sidebar to Orders, Inventory, Customers, Newsletter.

## Database changes (one migration)

- `categories` table + RLS (admin write, public read) + GRANTs.
- `products.category_id uuid references categories(id)`.
- Storage bucket `product-images` (public).
- No changes to existing RLS, roles, has_role, order policies, rate limiting, or sanitization.

## Security — explicitly preserved

No edits to: `useAuth.tsx` token-refresh handling, `has_role`, user_roles policies, order/order_items policies, edge function sanitization, rate limiter in `create-order`, guest access-token policy. Security memory unchanged.

## Performance

- All photo imports use `loading="lazy"` except hero.
- Route-level `React.lazy` + `Suspense` with branded skeletons for admin sub-pages.
- ProductGrid uses skeleton cards while loading.
- Externalize all generated photos to CDN via `lovable-assets`.

## Execution order

1. Tokens + fonts + tailwind config + base CSS
2. Generate photos + externalize
3. Shared primitives (Button variants, Footer, Section wrappers, DataTable, AdminLayout, Sidebar)
4. Storefront pages (Home → Products → Detail → Checkout → Confirmation → Auth/Account/Track → Privacy/Terms stubs)
5. Migration (categories + storage bucket)
6. Admin shell + all 13 sub-pages
7. Moderator restyled
8. Accessibility + responsive audit, fix contrast/spacing/alignment, verify build

## Technical notes

- `BrowserRouter` route restructure: keep `/admin` as layout route with nested children; old `?tab=` params no longer used — redirect legacy links to `/admin/overview`.
- Recharts already in deps (shadcn chart).
- No new external libs beyond `@fontsource/*`.
- Keep all existing supabase client imports and edge function calls untouched.

This is a large change set spanning ~40 files. After approval I'll execute in the order above and run the build before finishing.