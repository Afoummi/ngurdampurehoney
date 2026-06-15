## Plan: Production Features for Ngurdam Pure Honey

### 1. Admin User Management Panel
- Add a new **Users** tab in `src/pages/admin/Dashboard.tsx`, visible only when `role === 'admin'` (verified for binhafizgraphics@gmail.com via existing `user_roles` table).
- Create `src/components/admin/UsersTab.tsx`:
  - Table: Full name, Email, Role badge, Joined date, Actions.
  - Email fetched via new edge function `admin-list-users` (uses service role to read `auth.users`, requires caller to have admin role via JWT validation).
  - Delete action → calls new edge function `admin-delete-user` (service role `auth.admin.deleteUser`), cascades via existing FK to clean profiles & user_roles.
  - Confirmation `AlertDialog` before delete; admin cannot delete themselves.

### 2. Order Management Dashboard
- Enhance existing `OrdersTab.tsx`:
  - Metrics bar (Total Sales ₦, Pending count, Low-stock alerts count where stock < 5).
  - Status dropdown per order with values: `Pending → Processing → In Transit → Delivered`.
  - Updates via existing orders table `status` column.
- Create `src/components/admin/InventoryTab.tsx`:
  - Lists the 6 Ngurdam variants from `products` table.
  - Inline editable stock quantity with save button; updates `products.stock_quantity`.
  - Low-stock highlight (red badge if < 5).
- Add **Inventory** tab to admin Dashboard tabs list.

### 3. Checkout & Paystack Integration
- Update `src/pages/Checkout.tsx`:
  - Modern summary card: item, size badge, qty, line total, grand total in ₦.
  - Delivery details form (name, email, phone, address, city, state) with zod validation.
  - "Pay with Paystack" button → loads `https://js.paystack.co/v1/inline.js`, opens PaystackPop modal with **public test key** (`pk_test_xxx` placeholder — user can replace).
  - On successful callback → calls existing `create-order` edge function, sets order `status='paid'` and `payment_reference`.
- Add `payment_reference` column to orders if missing (migration).
- Show success → redirect to `/order-confirmation`.

### 4. Frontend Design Polish
- `ProductCard.tsx`: larger bold size label (e.g., "20 Litre Jerrycan"), prominent ₦ price in bold display font, cleaner spacing, subtle border/shadow.
- `ProductGrid.tsx`: tighter grid with consistent gaps.
- `HeroSection.tsx`: minor type hierarchy refinements (no full rewrite).

### Technical Details
- **Migration**: add `payment_reference text` to `orders` if not present; add `status` enum values via text check (keep flexible).
- **Edge functions** (new):
  - `admin-list-users` — verifies caller JWT, checks admin role, returns auth users + roles joined.
  - `admin-delete-user` — same auth gate, deletes from `auth.users` (cascades).
  - `verify-paystack` (optional simulation) — accepts reference, marks order paid. Since this is a simulation, mark paid client-side after Paystack inline success callback via `create-order`.
- **Secrets**: Will ask user for `PAYSTACK_PUBLIC_KEY` (publishable, safe in client) — or use a placeholder test key.
- **Tabs added** to admin dashboard: Users, Inventory.
- Moderator dashboard remains restricted (no user mgmt, no delete).

### Files to create/edit
- New: `src/components/admin/UsersTab.tsx`, `src/components/admin/InventoryTab.tsx`, `supabase/functions/admin-list-users/index.ts`, `supabase/functions/admin-delete-user/index.ts`, migration for `payment_reference`.
- Edit: `src/pages/admin/Dashboard.tsx`, `src/components/admin/OrdersTab.tsx`, `src/pages/Checkout.tsx`, `src/components/products/ProductCard.tsx`, `src/components/products/ProductGrid.tsx`, `index.html` (Paystack script optional, will inject dynamically).
