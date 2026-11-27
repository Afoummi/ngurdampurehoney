# Ngurdam Honey PHP/MySQL XAMPP conversion

## Goal

Deliver one complete downloadable ZIP of the existing Ngurdam Honey website converted to PHP 8.1+ and MySQL/MariaDB for XAMPP at `http://localhost/ngurdam-honey/`. Preserve the existing React/Lovable app and backend unchanged; use them as the design, content, and behavior reference.

## Scope and guardrails

- Include every current public route: Home, Products, Product Detail, About, Blog, Contact, Privacy, Terms, FAQ, Shipping, Returns, Authentication, Checkout, Order Confirmation, Track Order, and Customer Order History.
- Preserve the current forest-green, honey-gold, and cream branding, typography, logo, favicon, photography, page sections, and responsive layouts using the real assets already in the project.
- Migrate only public-facing site content and the product catalog. Do not copy live customer accounts, orders, newsletter signups, audit records, or other private/operational records. The new XAMPP database starts with no imported private or transactional data.
- The local PHP site may support new registrations, orders, tracking, customer history, newsletter signups, and audit entries created after installation; these remain local to the new site.
- WhatsApp remains the only checkout communication channel. Do not add Paystack or email/SMTP notifications. Recalculate prices and validate stock on the PHP server.
- Use the official brand details in the brief, with business/contact/social values editable from Site Settings. Do not invent missing contact information.
- Keep the conversion isolated from the current React application so the live preview and Lovable Cloud data remain untouched.

## Delivery phases

1. **Audit and map:** Confirm the current routes, storefront sections, product fields/variants, business settings, staff dashboard modules, existing images/fonts, and role boundaries. Produce a route-and-feature mapping for the PHP version.
2. **Standalone PHP foundation:** Create an isolated PHP project with Apache routing for the `/ngurdam-honey/` path, secure configuration outside the public directory, shared layout/assets, and a MySQL-compatible connection layer. Avoid React, Node, npm, Vite, external backend dependencies, or production secrets.
3. **Schema and public seed data:** Add SQL schema and relationships for products/variants/inventory, new-site users/roles, orders/items, public site settings/content, media references, newsletter, FAQs, testimonials, promotions, audit events, and login throttling. Seed only public content and catalog data; do not import private/live records.
4. **Storefront and customer flows:** Implement all listed public routes, search/filter/product details/cart, secure checkout/order creation, WhatsApp handoff, confirmation/tracking with non-guessable access, and customer account/order history for records created in the new installation.
5. **Admin and Moderator areas:** Implement the complete Admin modules from the brief and a separate Moderator experience with backend-enforced permissions. Moderators may view and change payment status only; revenue, reports, role management, and settings remain Admin-only. Enforce these limits on every protected PHP action.
6. **XAMPP packaging:** Include application source, SQL file, local assets, safe configuration example, upload directories, and an installation guide using XAMPP Control Panel/phpMyAdmin and the browser. Include first-Admin setup without hardcoded credentials. Package and inspect one ZIP for the user.
7. **Verification and report:** Check PHP syntax and JavaScript, exercise public routes and core flows, check Admin/Moderator authorization, verify responsive pages and local assets, inspect the ZIP contents, and report any runtime checks unavailable in this environment rather than claiming they passed.

## Technical decisions

- Keep the PHP project separate from the current React/Lovable runtime; no changes to current live data or existing customer/order records.
- Use PHP sessions with secure cookie settings, `password_hash`/`password_verify`, CSRF protection, session ID regeneration, login throttling, prepared SQL statements, transactions, output escaping, server-side authorization, safe upload validation, order ownership checks, and server-side inventory/price validation.
- Configuration and credentials stay outside the web root; the delivered example contains no real secrets or preconfigured administrator password.
- Staff permissions are checked in PHP on every protected action, not only in the navigation. The unresolved Moderator payment-status choice stays restricted until explicitly answered.